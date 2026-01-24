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
-- Add payout method security fields to partners
ALTER TABLE public.partners
  ADD COLUMN IF NOT EXISTS pending_payout_provider TEXT,
  ADD COLUMN IF NOT EXISTS pending_payout_token TEXT,
  ADD COLUMN IF NOT EXISTS pending_payout_last4 TEXT,
  ADD COLUMN IF NOT EXISTS pending_payout_requested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payout_change_active_after TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payout_change_confirmation_token TEXT,
  ADD COLUMN IF NOT EXISTS payout_change_confirmed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS payout_provider TEXT DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS payout_token TEXT,
  ADD COLUMN IF NOT EXISTS payout_last4 TEXT,
  ADD COLUMN IF NOT EXISTS payout_verified_at TIMESTAMPTZ;

-- Create function to mark a payout as paid and update all linked commissions
CREATE OR REPLACE FUNCTION public.mark_payout_paid(p_payout_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payout RECORD;
  v_now TIMESTAMPTZ := now();
  v_updated_count INTEGER;
BEGIN
  -- Get payout and verify status
  SELECT * INTO v_payout FROM partner_payouts WHERE id = p_payout_id;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Only mark paid if status allows
  IF v_payout.status NOT IN ('scheduled', 'ready', 'processing') THEN
    RETURN false;
  END IF;
  
  -- Update payout
  UPDATE partner_payouts
  SET status = 'paid', paid_at = v_now
  WHERE id = p_payout_id;
  
  -- Update all linked commissions via payout_items
  UPDATE partner_commissions pc
  SET status = 'paid', paid_at = v_now
  FROM payout_items pi
  WHERE pi.payout_id = p_payout_id
    AND pi.commission_id = pc.id
    AND pc.status != 'paid';
  
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  
  -- Log audit entry
  INSERT INTO partner_audit_logs (partner_id, action, resource_type, resource_id, new_value)
  VALUES (
    v_payout.partner_id,
    'payout_marked_paid',
    'payout',
    p_payout_id,
    jsonb_build_object('commissions_updated', v_updated_count, 'total_amount', v_payout.total_amount)
  );
  
  RETURN true;
END;
$$;

-- Create function to cancel a payout
CREATE OR REPLACE FUNCTION public.cancel_payout(p_payout_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payout RECORD;
  v_updated_count INTEGER;
BEGIN
  -- Get payout
  SELECT * INTO v_payout FROM partner_payouts WHERE id = p_payout_id;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Only cancel if not already paid
  IF v_payout.status IN ('paid') THEN
    RETURN false;
  END IF;
  
  -- Clear payout_id from linked commissions
  UPDATE partner_commissions pc
  SET payout_id = NULL
  FROM payout_items pi
  WHERE pi.payout_id = p_payout_id
    AND pi.commission_id = pc.id;
  
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  
  -- Update payout status
  UPDATE partner_payouts
  SET status = 'canceled'
  WHERE id = p_payout_id;
  
  -- Delete payout items
  DELETE FROM payout_items WHERE payout_id = p_payout_id;
  
  -- Log audit entry
  INSERT INTO partner_audit_logs (partner_id, action, resource_type, resource_id, new_value)
  VALUES (
    v_payout.partner_id,
    'payout_canceled',
    'payout',
    p_payout_id,
    jsonb_build_object('commissions_released', v_updated_count)
  );
  
  RETURN true;
END;
$$;

-- Create function to create payout batches
CREATE OR REPLACE FUNCTION public.create_payout_batch_for_partner(
  p_partner_id UUID,
  p_payout_date TIMESTAMPTZ,
  p_period_start TIMESTAMPTZ,
  p_period_end TIMESTAMPTZ
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payout_id UUID;
  v_total_amount NUMERIC := 0;
  v_commission_count INTEGER := 0;
  v_commission RECORD;
BEGIN
  -- Find eligible commissions for this partner
  SELECT 
    COUNT(*) as cnt,
    COALESCE(SUM(net_amount), 0) as total
  INTO v_commission_count, v_total_amount
  FROM partner_commissions
  WHERE partner_id = p_partner_id
    AND status IN ('earned', 'payable')
    AND payable_at <= p_payout_date
    AND payout_id IS NULL;
  
  -- Don't create empty batches
  IF v_commission_count = 0 THEN
    RETURN NULL;
  END IF;
  
  -- Create payout record
  INSERT INTO partner_payouts (
    partner_id, batch_date, payout_date, period_start, period_end,
    total_amount, commission_count, status
  ) VALUES (
    p_partner_id, p_payout_date::DATE, p_payout_date, p_period_start, p_period_end,
    v_total_amount, v_commission_count, 'scheduled'
  ) RETURNING id INTO v_payout_id;
  
  -- Create payout items and update commissions
  FOR v_commission IN
    SELECT id, net_amount
    FROM partner_commissions
    WHERE partner_id = p_partner_id
      AND status IN ('earned', 'payable')
      AND payable_at <= p_payout_date
      AND payout_id IS NULL
  LOOP
    -- Create payout item
    INSERT INTO payout_items (payout_id, commission_id, amount)
    VALUES (v_payout_id, v_commission.id, v_commission.net_amount);
    
    -- Link commission to payout
    UPDATE partner_commissions
    SET payout_id = v_payout_id
    WHERE id = v_commission.id;
  END LOOP;
  
  -- Log audit entry
  INSERT INTO partner_audit_logs (partner_id, action, resource_type, resource_id, new_value)
  VALUES (
    p_partner_id,
    'payout_batch_created',
    'payout',
    v_payout_id,
    jsonb_build_object('total_amount', v_total_amount, 'commission_count', v_commission_count, 'payout_date', p_payout_date)
  );
  
  RETURN v_payout_id;
END;
$$;

-- Create function to reconcile a payout (remove clawed back/disputed commissions)
CREATE OR REPLACE FUNCTION public.reconcile_payout(p_payout_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payout RECORD;
  v_removed_count INTEGER := 0;
  v_new_total NUMERIC;
  v_new_count INTEGER;
  v_removed_item RECORD;
BEGIN
  -- Get payout
  SELECT * INTO v_payout FROM partner_payouts WHERE id = p_payout_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Payout not found');
  END IF;
  
  -- Only reconcile scheduled or ready payouts
  IF v_payout.status NOT IN ('scheduled', 'ready') THEN
    RETURN jsonb_build_object('error', 'Cannot reconcile payout with status: ' || v_payout.status);
  END IF;
  
  -- Find and remove ineligible commissions
  FOR v_removed_item IN
    SELECT pi.id as item_id, pc.id as commission_id
    FROM payout_items pi
    JOIN partner_commissions pc ON pi.commission_id = pc.id
    WHERE pi.payout_id = p_payout_id
      AND pc.status IN ('clawed_back', 'disputed')
  LOOP
    -- Clear payout_id from commission
    UPDATE partner_commissions SET payout_id = NULL WHERE id = v_removed_item.commission_id;
    -- Remove payout item
    DELETE FROM payout_items WHERE id = v_removed_item.item_id;
    v_removed_count := v_removed_count + 1;
  END LOOP;
  
  -- Recalculate totals
  SELECT COUNT(*), COALESCE(SUM(amount), 0)
  INTO v_new_count, v_new_total
  FROM payout_items WHERE payout_id = p_payout_id;
  
  -- Update payout
  UPDATE partner_payouts
  SET total_amount = v_new_total, commission_count = v_new_count
  WHERE id = p_payout_id;
  
  -- If no items left, cancel the payout
  IF v_new_count = 0 THEN
    UPDATE partner_payouts SET status = 'canceled' WHERE id = p_payout_id;
  END IF;
  
  -- Log if changes occurred
  IF v_removed_count > 0 THEN
    INSERT INTO partner_audit_logs (partner_id, action, resource_type, resource_id, new_value)
    VALUES (
      v_payout.partner_id,
      'payout_reconciled',
      'payout',
      p_payout_id,
      jsonb_build_object('removed_count', v_removed_count, 'new_total', v_new_total, 'new_count', v_new_count)
    );
  END IF;
  
  RETURN jsonb_build_object(
    'removed_count', v_removed_count,
    'new_total', v_new_total,
    'new_count', v_new_count,
    'status', CASE WHEN v_new_count = 0 THEN 'canceled' ELSE v_payout.status::TEXT END
  );
END;
$$;

-- Update get_partner_dashboard_stats to include paid_ytd
DROP FUNCTION IF EXISTS public.get_partner_dashboard_stats(UUID);
CREATE OR REPLACE FUNCTION public.get_partner_dashboard_stats(_partner_id UUID)
RETURNS TABLE(
  total_referrals BIGINT,
  qualified_referrals BIGINT,
  pending_referrals BIGINT,
  referrals_last_30_days BIGINT,
  total_deals BIGINT,
  open_deals BIGINT,
  closed_won_deals BIGINT,
  total_deal_value NUMERIC,
  pending_commissions NUMERIC,
  earned_commissions NUMERIC,
  payable_commissions NUMERIC,
  paid_commissions NUMERIC,
  paid_ytd NUMERIC,
  next_payout_date DATE,
  next_payout_amount NUMERIC
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH referral_stats AS (
    SELECT 
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE status IN ('qualified', 'converted', 'accepted')) AS qualified,
      COUNT(*) FILTER (WHERE status = 'new') AS pending,
      COUNT(*) FILTER (WHERE created_at > now() - interval '30 days') AS last_30_days
    FROM referrals
    WHERE partner_id = _partner_id
  ),
  deal_stats AS (
    SELECT 
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE stage IN ('new', 'in_progress')) AS open,
      COUNT(*) FILTER (WHERE stage = 'closed_won') AS won,
      COALESCE(SUM(deal_value) FILTER (WHERE stage = 'closed_won'), 0) AS total_value
    FROM partner_deals
    WHERE partner_id = _partner_id
  ),
  commission_stats AS (
    SELECT 
      COALESCE(SUM(net_amount) FILTER (WHERE status = 'pending'), 0) AS pending,
      COALESCE(SUM(net_amount) FILTER (WHERE status = 'earned'), 0) AS earned,
      COALESCE(SUM(net_amount) FILTER (WHERE status = 'payable'), 0) AS payable,
      COALESCE(SUM(net_amount) FILTER (WHERE status = 'paid'), 0) AS paid,
      COALESCE(SUM(net_amount) FILTER (WHERE status = 'paid' AND EXTRACT(YEAR FROM paid_at) = EXTRACT(YEAR FROM now())), 0) AS ytd
    FROM partner_commissions
    WHERE partner_id = _partner_id
  ),
  next_payout AS (
    SELECT 
      batch_date,
      total_amount
    FROM partner_payouts
    WHERE partner_id = _partner_id AND status IN ('scheduled', 'ready')
    ORDER BY batch_date ASC
    LIMIT 1
  )
  SELECT 
    r.total AS total_referrals,
    r.qualified AS qualified_referrals,
    r.pending AS pending_referrals,
    r.last_30_days AS referrals_last_30_days,
    d.total AS total_deals,
    d.open AS open_deals,
    d.won AS closed_won_deals,
    d.total_value AS total_deal_value,
    c.pending AS pending_commissions,
    c.earned AS earned_commissions,
    c.payable AS payable_commissions,
    c.paid AS paid_commissions,
    c.ytd AS paid_ytd,
    np.batch_date AS next_payout_date,
    COALESCE(np.total_amount, 0) AS next_payout_amount
  FROM referral_stats r, deal_stats d, commission_stats c
  LEFT JOIN next_payout np ON true;
$$;
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
