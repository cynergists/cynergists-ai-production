<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() != 'pgsql') {
            return;
        }

        DB::unprepared(<<<'SQL'
-- STEP 9: Commission Engine v1 - Schema updates and functions

-- 1) Add missing columns to partner_commissions
ALTER TABLE partner_commissions 
  ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES clients(id),
  ADD COLUMN IF NOT EXISTS product_name TEXT,
  ADD COLUMN IF NOT EXISTS earned_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payable_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2) Add is_first_successful to payments
ALTER TABLE payments ADD COLUMN IF NOT EXISTS is_first_successful BOOLEAN DEFAULT false;

-- 3) Add first_successful_payment_at to clients
ALTER TABLE clients ADD COLUMN IF NOT EXISTS first_successful_payment_at TIMESTAMPTZ;

-- 4) Create unique index for commission idempotency per customer
CREATE UNIQUE INDEX IF NOT EXISTS idx_partner_commissions_customer_unique 
  ON partner_commissions(customer_id) 
  WHERE status NOT IN ('disputed', 'clawed_back');

-- 5) Create payable_at calculation function
-- Uses 15th of month cutoff rule with weekend adjustment for Denver timezone
CREATE OR REPLACE FUNCTION public.calculate_payable_at(p_earned_at TIMESTAMPTZ)
RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  denver_tz TEXT := 'America/Denver';
  earned_local TIMESTAMP;
  cutoff_day INT := 15;
  cutoff_datetime TIMESTAMP;
  payout_date DATE;
  payout_datetime TIMESTAMPTZ;
BEGIN
  -- Convert to Denver time
  earned_local := p_earned_at AT TIME ZONE denver_tz;
  
  -- Calculate cutoff datetime for the earned month (15th at 23:59:59)
  cutoff_datetime := date_trunc('month', earned_local) 
    + (cutoff_day - 1) * INTERVAL '1 day' 
    + INTERVAL '23 hours 59 minutes 59 seconds';
  
  -- Determine payout month
  IF earned_local <= cutoff_datetime THEN
    -- Earned on or before 15th - payable on 1st of next month
    payout_date := (date_trunc('month', earned_local) + INTERVAL '1 month')::DATE;
  ELSE
    -- Earned after 15th - payable on 1st of month after next
    payout_date := (date_trunc('month', earned_local) + INTERVAL '2 months')::DATE;
  END IF;
  
  -- Adjust for weekends (Saturday=6, Sunday=0 in DOW)
  IF EXTRACT(DOW FROM payout_date) = 6 THEN
    payout_date := payout_date + 2; -- Move to Monday
  ELSIF EXTRACT(DOW FROM payout_date) = 0 THEN
    payout_date := payout_date + 1; -- Move to Monday
  END IF;
  
  -- Return as timestamp with time zone at 09:00 Denver
  payout_datetime := (payout_date::TIMESTAMP + INTERVAL '9 hours') AT TIME ZONE denver_tz;
  
  RETURN payout_datetime;
END;
$$;

-- 6) Create commission creation function
CREATE OR REPLACE FUNCTION public.create_commission_for_payment(p_payment_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payment RECORD;
  v_commission_id UUID;
  v_existing_commission UUID;
  v_rate NUMERIC := 0.20;
  v_commission_amount NUMERIC;
  v_clawback_deadline TIMESTAMPTZ;
  v_payable_at TIMESTAMPTZ;
BEGIN
  -- Get payment details
  SELECT * INTO v_payment FROM payments WHERE id = p_payment_id;
  
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  
  -- Only create for first successful payments with partner attribution
  IF NOT v_payment.is_first_successful OR v_payment.partner_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Check if commission already exists for this customer (idempotency)
  SELECT id INTO v_existing_commission 
  FROM partner_commissions 
  WHERE customer_id = v_payment.client_id 
    AND status NOT IN ('disputed', 'clawed_back')
  LIMIT 1;
  
  IF v_existing_commission IS NOT NULL THEN
    RETURN v_existing_commission; -- Already exists, return existing ID
  END IF;
  
  -- Calculate commission
  v_commission_amount := v_payment.amount * v_rate;
  v_clawback_deadline := v_payment.captured_at + INTERVAL '30 days';
  v_payable_at := calculate_payable_at(v_payment.captured_at);
  
  -- Insert commission
  INSERT INTO partner_commissions (
    partner_id, customer_id, deal_id, payment_id,
    gross_amount, net_amount, commission_rate,
    status, earned_at, clawback_eligible_until, payable_at
  ) VALUES (
    v_payment.partner_id, v_payment.client_id, v_payment.deal_id, v_payment.id,
    v_payment.amount, v_commission_amount, v_rate,
    'earned', v_payment.captured_at, v_clawback_deadline, v_payable_at
  ) RETURNING id INTO v_commission_id;
  
  RETURN v_commission_id;
END;
$$;

-- 7) Create function to update commission status (earned -> payable)
CREATE OR REPLACE FUNCTION public.update_commission_status_to_payable()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated_count INTEGER;
BEGIN
  -- Update earned commissions to payable if:
  -- 1. Current time >= payable_at
  -- 2. The linked payment is not fully refunded
  -- 3. Status is 'earned'
  WITH eligible_commissions AS (
    SELECT pc.id
    FROM partner_commissions pc
    LEFT JOIN payments p ON pc.payment_id = p.id
    WHERE pc.status = 'earned'
      AND pc.payable_at <= now()
      AND (p.id IS NULL OR p.status NOT IN ('refunded'))
  )
  UPDATE partner_commissions 
  SET status = 'payable'
  WHERE id IN (SELECT id FROM eligible_commissions);
  
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  RETURN v_updated_count;
END;
$$;

-- 8) Create function to handle refund clawbacks
CREATE OR REPLACE FUNCTION public.process_commission_clawback(
  p_payment_id UUID,
  p_refund_amount NUMERIC,
  p_is_full_refund BOOLEAN
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_commission RECORD;
  v_new_basis_amount NUMERIC;
  v_new_commission_amount NUMERIC;
  v_rate NUMERIC := 0.20;
  v_now TIMESTAMPTZ := now();
BEGIN
  -- Find commission linked to this payment
  SELECT * INTO v_commission
  FROM partner_commissions
  WHERE payment_id = p_payment_id
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  
  -- Check if within clawback window (30 days)
  IF v_commission.clawback_eligible_until IS NOT NULL AND v_now <= v_commission.clawback_eligible_until THEN
    IF p_is_full_refund THEN
      -- Full refund within 30 days - claw back the commission
      UPDATE partner_commissions
      SET status = 'clawed_back',
          notes = COALESCE(notes, '') || E'\n' || 
            format('[%s] Full refund of $%s - commission clawed back', 
              to_char(v_now, 'YYYY-MM-DD HH24:MI'), p_refund_amount)
      WHERE id = v_commission.id;
    ELSE
      -- Partial refund within 30 days - reduce commission proportionally
      v_new_basis_amount := v_commission.gross_amount - p_refund_amount;
      v_new_commission_amount := v_new_basis_amount * v_rate;
      
      IF v_new_commission_amount <= 0 THEN
        -- Commission reduced to zero or negative - claw back
        UPDATE partner_commissions
        SET status = 'clawed_back',
            net_amount = 0,
            notes = COALESCE(notes, '') || E'\n' || 
              format('[%s] Partial refund of $%s reduced commission to $0 - clawed back', 
                to_char(v_now, 'YYYY-MM-DD HH24:MI'), p_refund_amount)
        WHERE id = v_commission.id;
      ELSE
        -- Reduce commission amount
        UPDATE partner_commissions
        SET gross_amount = v_new_basis_amount,
            net_amount = v_new_commission_amount,
            notes = COALESCE(notes, '') || E'\n' || 
              format('[%s] Partial refund of $%s - commission reduced from $%s to $%s', 
                to_char(v_now, 'YYYY-MM-DD HH24:MI'), p_refund_amount, 
                v_commission.net_amount, v_new_commission_amount)
        WHERE id = v_commission.id;
      END IF;
    END IF;
  ELSE
    -- Refund after clawback window - just add a note
    UPDATE partner_commissions
    SET notes = COALESCE(notes, '') || E'\n' || 
      format('[%s] Refund of $%s occurred after 30-day clawback window - no adjustment', 
        to_char(v_now, 'YYYY-MM-DD HH24:MI'), p_refund_amount)
    WHERE id = v_commission.id;
  END IF;
  
  RETURN v_commission.id;
END;
$$;
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
