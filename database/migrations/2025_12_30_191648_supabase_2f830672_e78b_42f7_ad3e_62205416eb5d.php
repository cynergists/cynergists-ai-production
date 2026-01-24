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
-- =====================================================
-- Partner Portal Database Schema
-- =====================================================

-- Create enums for portal statuses
CREATE TYPE public.referral_status AS ENUM ('new', 'needs_approval', 'qualified', 'converted', 'rejected');
CREATE TYPE public.referral_source AS ENUM ('form_submit', 'booked_call', 'paid_checkout', 'deal_registration');
CREATE TYPE public.attribution_type AS ENUM ('deal_registration', 'last_touch');
CREATE TYPE public.deal_stage AS ENUM ('new', 'in_progress', 'closed_won', 'closed_lost');
CREATE TYPE public.payment_status AS ENUM ('captured', 'refunded', 'failed');
CREATE TYPE public.commission_status AS ENUM ('pending', 'earned', 'payable', 'paid', 'clawed_back', 'disputed');
CREATE TYPE public.payout_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE public.payout_method_type AS ENUM ('ach', 'check');
CREATE TYPE public.asset_category AS ENUM ('copy', 'creative', 'template');
CREATE TYPE public.ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE public.ticket_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE public.ticket_sender_type AS ENUM ('partner', 'admin');

-- =====================================================
-- Extend partners table with portal-specific columns
-- =====================================================
ALTER TABLE public.partners 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS payout_email_confirmed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS report_schedule JSONB DEFAULT NULL;

-- Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_partners_slug ON public.partners(slug);

-- =====================================================
-- partner_users - Link users to partner accounts
-- =====================================================
CREATE TABLE public.partner_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'owner',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(partner_id, user_id)
);

ALTER TABLE public.partner_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view their own user links"
ON public.partner_users FOR SELECT
USING (
  partner_id IN (SELECT partner_id FROM public.partner_users WHERE user_id = auth.uid())
);

CREATE POLICY "Service role can manage partner_users"
ON public.partner_users FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- =====================================================
-- referrals - Track partner referrals
-- =====================================================
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  lead_email TEXT NOT NULL,
  lead_name TEXT,
  lead_phone TEXT,
  lead_company TEXT,
  source public.referral_source NOT NULL,
  status public.referral_status NOT NULL DEFAULT 'new',
  attribution_type public.attribution_type NOT NULL DEFAULT 'last_touch',
  landing_page TEXT,
  utm_params JSONB,
  deal_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  converted_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_referrals_partner_id ON public.referrals(partner_id);
CREATE INDEX idx_referrals_status ON public.referrals(status);
CREATE INDEX idx_referrals_lead_email ON public.referrals(lead_email);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view their own referrals"
ON public.referrals FOR SELECT
USING (
  partner_id IN (SELECT partner_id FROM public.partner_users WHERE user_id = auth.uid())
);

CREATE POLICY "Partners can insert referrals for their account"
ON public.referrals FOR INSERT
WITH CHECK (
  partner_id IN (SELECT partner_id FROM public.partner_users WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can manage all referrals"
ON public.referrals FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can manage referrals"
ON public.referrals FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- =====================================================
-- partner_deals - Track sales pipeline for partners
-- =====================================================
CREATE TABLE public.partner_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id UUID REFERENCES public.referrals(id) ON DELETE SET NULL,
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  stage public.deal_stage NOT NULL DEFAULT 'new',
  deal_value NUMERIC(12,2) NOT NULL DEFAULT 0,
  expected_close_date DATE,
  closed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_partner_deals_partner_id ON public.partner_deals(partner_id);
CREATE INDEX idx_partner_deals_stage ON public.partner_deals(stage);
CREATE INDEX idx_partner_deals_referral_id ON public.partner_deals(referral_id);

ALTER TABLE public.partner_deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view their own deals"
ON public.partner_deals FOR SELECT
USING (
  partner_id IN (SELECT partner_id FROM public.partner_users WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can manage all deals"
ON public.partner_deals FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can manage partner_deals"
ON public.partner_deals FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- =====================================================
-- partner_payments - Square payment records for partners
-- =====================================================
CREATE TABLE public.partner_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES public.partner_deals(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  square_payment_id TEXT UNIQUE,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status public.payment_status NOT NULL DEFAULT 'captured',
  captured_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_partner_payments_partner_id ON public.partner_payments(partner_id);
CREATE INDEX idx_partner_payments_deal_id ON public.partner_payments(deal_id);
CREATE INDEX idx_partner_payments_status ON public.partner_payments(status);
CREATE INDEX idx_partner_payments_square_id ON public.partner_payments(square_payment_id);

ALTER TABLE public.partner_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view their own payments"
ON public.partner_payments FOR SELECT
USING (
  partner_id IN (SELECT partner_id FROM public.partner_users WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can manage all payments"
ON public.partner_payments FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can manage partner_payments"
ON public.partner_payments FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- =====================================================
-- partner_commissions - Commission calculations
-- =====================================================
CREATE TABLE public.partner_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES public.partner_deals(id) ON DELETE SET NULL,
  payment_id UUID REFERENCES public.partner_payments(id) ON DELETE SET NULL,
  commission_rate NUMERIC(5,4) NOT NULL DEFAULT 0.20,
  gross_amount NUMERIC(12,2) NOT NULL,
  net_amount NUMERIC(12,2) NOT NULL,
  status public.commission_status NOT NULL DEFAULT 'pending',
  clawback_eligible_until TIMESTAMPTZ,
  payout_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_partner_commissions_partner_id ON public.partner_commissions(partner_id);
CREATE INDEX idx_partner_commissions_status ON public.partner_commissions(status);
CREATE INDEX idx_partner_commissions_payout_id ON public.partner_commissions(payout_id);

ALTER TABLE public.partner_commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view their own commissions"
ON public.partner_commissions FOR SELECT
USING (
  partner_id IN (SELECT partner_id FROM public.partner_users WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can manage all commissions"
ON public.partner_commissions FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can manage partner_commissions"
ON public.partner_commissions FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- =====================================================
-- partner_payout_methods - Tokenized bank accounts
-- =====================================================
CREATE TABLE public.partner_payout_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  method_type public.payout_method_type NOT NULL DEFAULT 'ach',
  token_reference TEXT,
  last_four_digits TEXT,
  bank_name TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payout_methods_partner_id ON public.partner_payout_methods(partner_id);

ALTER TABLE public.partner_payout_methods ENABLE ROW LEVEL SECURITY;

-- Only active partners can view their payout methods
CREATE POLICY "Active partners can view their own payout methods"
ON public.partner_payout_methods FOR SELECT
USING (
  partner_id IN (
    SELECT pu.partner_id FROM public.partner_users pu
    JOIN public.partners p ON p.id = pu.partner_id
    WHERE pu.user_id = auth.uid() AND p.partner_status = 'active'
  )
);

CREATE POLICY "Admins can manage all payout methods"
ON public.partner_payout_methods FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can manage payout_methods"
ON public.partner_payout_methods FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- =====================================================
-- partner_payouts - Payout batches
-- =====================================================
CREATE TABLE public.partner_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  payout_method_id UUID REFERENCES public.partner_payout_methods(id) ON DELETE SET NULL,
  total_amount NUMERIC(12,2) NOT NULL,
  commission_count INTEGER NOT NULL DEFAULT 0,
  status public.payout_status NOT NULL DEFAULT 'pending',
  batch_date DATE NOT NULL,
  paid_at TIMESTAMPTZ,
  reference_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_partner_payouts_partner_id ON public.partner_payouts(partner_id);
CREATE INDEX idx_partner_payouts_status ON public.partner_payouts(status);
CREATE INDEX idx_partner_payouts_batch_date ON public.partner_payouts(batch_date);

ALTER TABLE public.partner_payouts ENABLE ROW LEVEL SECURITY;

-- Only active partners can view their payouts
CREATE POLICY "Active partners can view their own payouts"
ON public.partner_payouts FOR SELECT
USING (
  partner_id IN (
    SELECT pu.partner_id FROM public.partner_users pu
    JOIN public.partners p ON p.id = pu.partner_id
    WHERE pu.user_id = auth.uid() AND p.partner_status = 'active'
  )
);

CREATE POLICY "Admins can manage all payouts"
ON public.partner_payouts FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can manage partner_payouts"
ON public.partner_payouts FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Add foreign key for commissions payout_id
ALTER TABLE public.partner_commissions
ADD CONSTRAINT fk_commissions_payout
FOREIGN KEY (payout_id) REFERENCES public.partner_payouts(id) ON DELETE SET NULL;

-- =====================================================
-- partner_assets - Marketing materials
-- =====================================================
CREATE TABLE public.partner_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category public.asset_category NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  file_url TEXT,
  file_type TEXT,
  auto_append_partner_url BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_partner_assets_category ON public.partner_assets(category);
CREATE INDEX idx_partner_assets_is_active ON public.partner_assets(is_active);

ALTER TABLE public.partner_assets ENABLE ROW LEVEL SECURITY;

-- All partners can view active assets
CREATE POLICY "Partners can view active assets"
ON public.partner_assets FOR SELECT
USING (
  is_active = true AND
  EXISTS (SELECT 1 FROM public.partner_users WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can manage all assets"
ON public.partner_assets FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can manage partner_assets"
ON public.partner_assets FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- =====================================================
-- partner_tickets - Support tickets
-- =====================================================
CREATE TABLE public.partner_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  description TEXT,
  status public.ticket_status NOT NULL DEFAULT 'open',
  priority public.ticket_priority NOT NULL DEFAULT 'medium',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_to UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_partner_tickets_partner_id ON public.partner_tickets(partner_id);
CREATE INDEX idx_partner_tickets_status ON public.partner_tickets(status);

ALTER TABLE public.partner_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view their own tickets"
ON public.partner_tickets FOR SELECT
USING (
  partner_id IN (SELECT partner_id FROM public.partner_users WHERE user_id = auth.uid())
);

CREATE POLICY "Partners can create tickets for their account"
ON public.partner_tickets FOR INSERT
WITH CHECK (
  partner_id IN (SELECT partner_id FROM public.partner_users WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can manage all tickets"
ON public.partner_tickets FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can manage partner_tickets"
ON public.partner_tickets FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- =====================================================
-- partner_ticket_messages - Ticket thread
-- =====================================================
CREATE TABLE public.partner_ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.partner_tickets(id) ON DELETE CASCADE,
  sender_type public.ticket_sender_type NOT NULL,
  sender_id UUID,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ticket_messages_ticket_id ON public.partner_ticket_messages(ticket_id);

ALTER TABLE public.partner_ticket_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view messages for their tickets"
ON public.partner_ticket_messages FOR SELECT
USING (
  ticket_id IN (
    SELECT t.id FROM public.partner_tickets t
    JOIN public.partner_users pu ON pu.partner_id = t.partner_id
    WHERE pu.user_id = auth.uid()
  )
);

CREATE POLICY "Partners can add messages to their tickets"
ON public.partner_ticket_messages FOR INSERT
WITH CHECK (
  ticket_id IN (
    SELECT t.id FROM public.partner_tickets t
    JOIN public.partner_users pu ON pu.partner_id = t.partner_id
    WHERE pu.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all ticket messages"
ON public.partner_ticket_messages FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can manage ticket_messages"
ON public.partner_ticket_messages FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- =====================================================
-- partner_audit_logs - Security audit trail
-- =====================================================
CREATE TABLE public.partner_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  old_value JSONB,
  new_value JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_partner_audit_logs_partner_id ON public.partner_audit_logs(partner_id);
CREATE INDEX idx_partner_audit_logs_action ON public.partner_audit_logs(action);
CREATE INDEX idx_partner_audit_logs_created_at ON public.partner_audit_logs(created_at);

ALTER TABLE public.partner_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view their own audit logs"
ON public.partner_audit_logs FOR SELECT
USING (
  partner_id IN (SELECT partner_id FROM public.partner_users WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can manage all audit logs"
ON public.partner_audit_logs FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can manage audit_logs"
ON public.partner_audit_logs FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- =====================================================
-- partner_scheduled_reports - Report scheduling for active partners
-- =====================================================
CREATE TABLE public.partner_scheduled_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  schedule_type TEXT NOT NULL CHECK (schedule_type IN ('weekly', 'monthly', 'quarterly')),
  next_run_at TIMESTAMPTZ NOT NULL,
  last_run_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_scheduled_reports_partner_id ON public.partner_scheduled_reports(partner_id);
CREATE INDEX idx_scheduled_reports_next_run ON public.partner_scheduled_reports(next_run_at);

ALTER TABLE public.partner_scheduled_reports ENABLE ROW LEVEL SECURITY;

-- Only active partners can view/manage their scheduled reports
CREATE POLICY "Active partners can view their scheduled reports"
ON public.partner_scheduled_reports FOR SELECT
USING (
  partner_id IN (
    SELECT pu.partner_id FROM public.partner_users pu
    JOIN public.partners p ON p.id = pu.partner_id
    WHERE pu.user_id = auth.uid() AND p.partner_status = 'active'
  )
);

CREATE POLICY "Active partners can manage their scheduled reports"
ON public.partner_scheduled_reports FOR ALL
USING (
  partner_id IN (
    SELECT pu.partner_id FROM public.partner_users pu
    JOIN public.partners p ON p.id = pu.partner_id
    WHERE pu.user_id = auth.uid() AND p.partner_status = 'active'
  )
)
WITH CHECK (
  partner_id IN (
    SELECT pu.partner_id FROM public.partner_users pu
    JOIN public.partners p ON p.id = pu.partner_id
    WHERE pu.user_id = auth.uid() AND p.partner_status = 'active'
  )
);

CREATE POLICY "Admins can manage all scheduled reports"
ON public.partner_scheduled_reports FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can manage scheduled_reports"
ON public.partner_scheduled_reports FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- =====================================================
-- Functions for partner portal
-- =====================================================

-- Function to get partner by user id
CREATE OR REPLACE FUNCTION public.get_partner_by_user_id(_user_id UUID)
RETURNS TABLE (
  id UUID,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  company_name TEXT,
  partner_status TEXT,
  slug TEXT,
  email_verified BOOLEAN,
  mfa_enabled BOOLEAN,
  commission_rate NUMERIC,
  total_commissions_earned NUMERIC,
  outstanding_commission_balance NUMERIC,
  referrals_given INTEGER,
  qualified_referrals INTEGER,
  closed_won_deals INTEGER,
  revenue_generated NUMERIC
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.email,
    p.company_name,
    p.partner_status,
    p.slug,
    p.email_verified,
    p.mfa_enabled,
    p.commission_rate,
    p.total_commissions_earned,
    p.outstanding_commission_balance,
    p.referrals_given,
    p.qualified_referrals,
    p.closed_won_deals,
    p.revenue_generated
  FROM public.partners p
  JOIN public.partner_users pu ON pu.partner_id = p.id
  WHERE pu.user_id = _user_id
  LIMIT 1;
$$;

-- Function to get partner by slug (for landing pages)
CREATE OR REPLACE FUNCTION public.get_partner_by_slug(_slug TEXT)
RETURNS TABLE (
  id UUID,
  first_name TEXT,
  last_name TEXT,
  company_name TEXT,
  slug TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.company_name,
    p.slug
  FROM public.partners p
  WHERE p.slug = _slug AND p.partner_status IN ('pending', 'active')
  LIMIT 1;
$$;

-- Function to get partner dashboard stats
CREATE OR REPLACE FUNCTION public.get_partner_dashboard_stats(_partner_id UUID)
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
      COUNT(*) FILTER (WHERE status IN ('qualified', 'converted')) AS qualified,
      COUNT(*) FILTER (WHERE status = 'new') AS pending
    FROM public.referrals
    WHERE partner_id = _partner_id
  ),
  deal_stats AS (
    SELECT 
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE stage IN ('new', 'in_progress')) AS open,
      COUNT(*) FILTER (WHERE stage = 'closed_won') AS won,
      COALESCE(SUM(deal_value) FILTER (WHERE stage = 'closed_won'), 0) AS total_value
    FROM public.partner_deals
    WHERE partner_id = _partner_id
  ),
  commission_stats AS (
    SELECT 
      COALESCE(SUM(net_amount) FILTER (WHERE status = 'pending'), 0) AS pending,
      COALESCE(SUM(net_amount) FILTER (WHERE status = 'earned'), 0) AS earned,
      COALESCE(SUM(net_amount) FILTER (WHERE status = 'payable'), 0) AS payable,
      COALESCE(SUM(net_amount) FILTER (WHERE status = 'paid'), 0) AS paid
    FROM public.partner_commissions
    WHERE partner_id = _partner_id
  ),
  next_payout AS (
    SELECT 
      batch_date,
      total_amount
    FROM public.partner_payouts
    WHERE partner_id = _partner_id AND status = 'pending'
    ORDER BY batch_date ASC
    LIMIT 1
  )
  SELECT 
    r.total AS total_referrals,
    r.qualified AS qualified_referrals,
    r.pending AS pending_referrals,
    d.total AS total_deals,
    d.open AS open_deals,
    d.won AS closed_won_deals,
    d.total_value AS total_deal_value,
    c.pending AS pending_commissions,
    c.earned AS earned_commissions,
    c.payable AS payable_commissions,
    c.paid AS paid_commissions,
    np.batch_date AS next_payout_date,
    COALESCE(np.total_amount, 0) AS next_payout_amount
  FROM referral_stats r, deal_stats d, commission_stats c
  LEFT JOIN next_payout np ON true;
$$;

-- Trigger to update updated_at on tables
CREATE TRIGGER update_referrals_updated_at
  BEFORE UPDATE ON public.referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_partner_deals_updated_at
  BEFORE UPDATE ON public.partner_deals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_partner_payments_updated_at
  BEFORE UPDATE ON public.partner_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_partner_commissions_updated_at
  BEFORE UPDATE ON public.partner_commissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payout_methods_updated_at
  BEFORE UPDATE ON public.partner_payout_methods
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_partner_payouts_updated_at
  BEFORE UPDATE ON public.partner_payouts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_partner_assets_updated_at
  BEFORE UPDATE ON public.partner_assets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_partner_tickets_updated_at
  BEFORE UPDATE ON public.partner_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scheduled_reports_updated_at
  BEFORE UPDATE ON public.partner_scheduled_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
