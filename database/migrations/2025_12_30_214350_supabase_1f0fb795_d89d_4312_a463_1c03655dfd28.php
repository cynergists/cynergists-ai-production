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
-- First create the disputes table (it wasn't created in previous failed migration)
CREATE TABLE IF NOT EXISTS public.disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  commission_id UUID NOT NULL REFERENCES public.partner_commissions(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_review', 'resolved', 'rejected')),
  prior_commission_status TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  resolved_by_admin_id UUID,
  ticket_id UUID,
  CONSTRAINT disputes_unique_commission UNIQUE (commission_id)
);

-- Enable RLS
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Partners can view their own disputes" ON public.disputes;
DROP POLICY IF EXISTS "Partners can create disputes" ON public.disputes;
DROP POLICY IF EXISTS "Admins can manage all disputes" ON public.disputes;
DROP POLICY IF EXISTS "Service role can manage disputes" ON public.disputes;

-- Create RLS policies
CREATE POLICY "Partners can view their own disputes"
  ON public.disputes FOR SELECT
  USING (partner_id IN (SELECT partner_id FROM partner_users WHERE user_id = auth.uid()));

CREATE POLICY "Partners can create disputes"
  ON public.disputes FOR INSERT
  WITH CHECK (partner_id IN (SELECT partner_id FROM partner_users WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all disputes"
  ON public.disputes FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can manage disputes"
  ON public.disputes FOR ALL
  USING (auth.role() = 'service_role'::text)
  WITH CHECK (auth.role() = 'service_role'::text);

-- Add foreign key to partner_tickets (if it exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'disputes_ticket_fkey'
  ) THEN
    ALTER TABLE public.disputes
      ADD CONSTRAINT disputes_ticket_fkey FOREIGN KEY (ticket_id) REFERENCES public.partner_tickets(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Update partner_tickets table
ALTER TABLE public.partner_tickets
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS deal_id UUID,
  ADD COLUMN IF NOT EXISTS commission_id UUID,
  ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

-- Add check constraint if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'partner_tickets_category_check'
  ) THEN
    ALTER TABLE public.partner_tickets
      ADD CONSTRAINT partner_tickets_category_check CHECK (category IN ('payout', 'commission', 'deal', 'marketing', 'technical', 'other'));
  END IF;
EXCEPTION WHEN others THEN NULL;
END $$;

-- Add foreign keys if not exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'partner_tickets_deal_id_fkey'
  ) THEN
    ALTER TABLE public.partner_tickets
      ADD CONSTRAINT partner_tickets_deal_id_fkey FOREIGN KEY (deal_id) REFERENCES public.partner_deals(id) ON DELETE SET NULL;
  END IF;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'partner_tickets_commission_id_fkey'
  ) THEN
    ALTER TABLE public.partner_tickets
      ADD CONSTRAINT partner_tickets_commission_id_fkey FOREIGN KEY (commission_id) REFERENCES public.partner_commissions(id) ON DELETE SET NULL;
  END IF;
EXCEPTION WHEN others THEN NULL;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_disputes_partner_id ON public.disputes(partner_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON public.disputes(status);
CREATE INDEX IF NOT EXISTS idx_disputes_commission_id ON public.disputes(commission_id);
CREATE INDEX IF NOT EXISTS idx_partner_tickets_category ON public.partner_tickets(category);
CREATE INDEX IF NOT EXISTS idx_partner_tickets_deal_id ON public.partner_tickets(deal_id);
CREATE INDEX IF NOT EXISTS idx_partner_tickets_commission_id ON public.partner_tickets(commission_id);

-- Update get_partner_dashboard_stats function
DROP FUNCTION IF EXISTS get_partner_dashboard_stats(UUID);

CREATE FUNCTION get_partner_dashboard_stats(_partner_id UUID)
RETURNS TABLE (
  total_referrals BIGINT,
  qualified_referrals BIGINT,
  pending_referrals BIGINT,
  total_deals BIGINT,
  open_deals BIGINT,
  closed_won_deals BIGINT,
  total_deal_value NUMERIC,
  pending_commissions NUMERIC,
  earned_commissions NUMERIC,
  payable_commissions NUMERIC,
  paid_commissions NUMERIC,
  next_payout_date TIMESTAMPTZ,
  next_payout_amount NUMERIC,
  deals_new BIGINT,
  deals_in_progress BIGINT,
  deals_closed_won BIGINT,
  deals_closed_lost BIGINT,
  referrals_last_30_days BIGINT,
  earned_this_month NUMERIC,
  paid_ytd NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE((SELECT COUNT(*) FROM referrals r WHERE r.partner_id = _partner_id), 0)::BIGINT,
    COALESCE((SELECT COUNT(*) FROM referrals r WHERE r.partner_id = _partner_id AND r.status = 'accepted'), 0)::BIGINT,
    COALESCE((SELECT COUNT(*) FROM referrals r WHERE r.partner_id = _partner_id AND r.status = 'pending'), 0)::BIGINT,
    COALESCE((SELECT COUNT(*) FROM partner_deals pd WHERE pd.partner_id = _partner_id), 0)::BIGINT,
    COALESCE((SELECT COUNT(*) FROM partner_deals pd WHERE pd.partner_id = _partner_id AND pd.stage IN ('new', 'in_progress')), 0)::BIGINT,
    COALESCE((SELECT COUNT(*) FROM partner_deals pd WHERE pd.partner_id = _partner_id AND pd.stage = 'closed_won'), 0)::BIGINT,
    COALESCE((SELECT SUM(pd.deal_value) FROM partner_deals pd WHERE pd.partner_id = _partner_id AND pd.stage = 'closed_won'), 0)::NUMERIC,
    COALESCE((SELECT SUM(pc.net_amount) FROM partner_commissions pc WHERE pc.partner_id = _partner_id AND pc.status = 'pending'), 0)::NUMERIC,
    COALESCE((SELECT SUM(pc.net_amount) FROM partner_commissions pc WHERE pc.partner_id = _partner_id AND pc.status = 'earned'), 0)::NUMERIC,
    COALESCE((SELECT SUM(pc.net_amount) FROM partner_commissions pc WHERE pc.partner_id = _partner_id AND pc.status = 'payable'), 0)::NUMERIC,
    COALESCE((SELECT SUM(pc.net_amount) FROM partner_commissions pc WHERE pc.partner_id = _partner_id AND pc.status = 'paid'), 0)::NUMERIC,
    (SELECT pp.payout_date FROM partner_payouts pp WHERE pp.partner_id = _partner_id AND pp.status IN ('scheduled', 'ready') ORDER BY pp.payout_date LIMIT 1)::TIMESTAMPTZ,
    COALESCE((SELECT pp.total_amount FROM partner_payouts pp WHERE pp.partner_id = _partner_id AND pp.status IN ('scheduled', 'ready') ORDER BY pp.payout_date LIMIT 1), 0)::NUMERIC,
    COALESCE((SELECT COUNT(*) FROM partner_deals pd WHERE pd.partner_id = _partner_id AND pd.stage = 'new'), 0)::BIGINT,
    COALESCE((SELECT COUNT(*) FROM partner_deals pd WHERE pd.partner_id = _partner_id AND pd.stage = 'in_progress'), 0)::BIGINT,
    COALESCE((SELECT COUNT(*) FROM partner_deals pd WHERE pd.partner_id = _partner_id AND pd.stage = 'closed_won'), 0)::BIGINT,
    COALESCE((SELECT COUNT(*) FROM partner_deals pd WHERE pd.partner_id = _partner_id AND pd.stage = 'closed_lost'), 0)::BIGINT,
    COALESCE((SELECT COUNT(*) FROM referrals r WHERE r.partner_id = _partner_id AND r.created_at >= NOW() - INTERVAL '30 days'), 0)::BIGINT,
    COALESCE((SELECT SUM(pc.net_amount) FROM partner_commissions pc WHERE pc.partner_id = _partner_id AND pc.status IN ('earned', 'payable', 'paid') AND pc.earned_at >= date_trunc('month', CURRENT_DATE)), 0)::NUMERIC,
    COALESCE((SELECT SUM(pc.net_amount) FROM partner_commissions pc WHERE pc.partner_id = _partner_id AND pc.status = 'paid' AND pc.paid_at >= date_trunc('year', CURRENT_DATE)), 0)::NUMERIC;
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
