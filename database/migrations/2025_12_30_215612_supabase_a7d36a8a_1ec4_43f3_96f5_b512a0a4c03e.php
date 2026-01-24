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
-- STEP 13: Hardening, Fraud Defenses, Alerting, and Launch Readiness

-- 1. Update partners table with fraud scoring columns
ALTER TABLE public.partners
  ADD COLUMN IF NOT EXISTS risk_score INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS risk_level TEXT DEFAULT 'low';

-- 2. Update referrals table with tracking data
ALTER TABLE public.referrals
  ADD COLUMN IF NOT EXISTS ip_address TEXT,
  ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- 3. Create notifications table for system alerts
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  category TEXT NOT NULL CHECK (category IN ('webhook', 'payout', 'report', 'fraud', 'permissions', 'integrity', 'payment', 'commission')),
  title TEXT NOT NULL,
  details TEXT,
  resource_type TEXT,
  resource_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  resolution_notes TEXT
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Admins can manage all notifications
CREATE POLICY "Admins can manage notifications"
  ON public.notifications FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Service role can manage notifications
CREATE POLICY "Service role can manage notifications"
  ON public.notifications FOR ALL
  USING (auth.role() = 'service_role'::text)
  WITH CHECK (auth.role() = 'service_role'::text);

-- 4. Create launch_checks table for audit trail
CREATE TABLE IF NOT EXISTS public.launch_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_name TEXT NOT NULL,
  check_category TEXT NOT NULL CHECK (check_category IN ('security', 'permissions', 'idempotency', 'data_integrity', 'rls')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'pass', 'fail', 'skipped')),
  details TEXT,
  ran_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ran_by_admin_id UUID
);

-- Enable RLS on launch_checks
ALTER TABLE public.launch_checks ENABLE ROW LEVEL SECURITY;

-- Admins can manage launch checks
CREATE POLICY "Admins can manage launch_checks"
  ON public.launch_checks FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Service role can manage launch_checks
CREATE POLICY "Service role can manage launch_checks"
  ON public.launch_checks FOR ALL
  USING (auth.role() = 'service_role'::text)
  WITH CHECK (auth.role() = 'service_role'::text);

-- 5. Create system_config table for launch switches
CREATE TABLE IF NOT EXISTS public.system_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT 'true'::jsonb,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID
);

-- Enable RLS on system_config
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- Admins can read system_config
CREATE POLICY "Admins can read system_config"
  ON public.system_config FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update system_config
CREATE POLICY "Admins can update system_config"
  ON public.system_config FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Service role can manage system_config
CREATE POLICY "Service role can manage system_config"
  ON public.system_config FOR ALL
  USING (auth.role() = 'service_role'::text)
  WITH CHECK (auth.role() = 'service_role'::text);

-- Partners can read specific config keys they need
CREATE POLICY "Partners can read partner-relevant config"
  ON public.system_config FOR SELECT
  USING (key IN ('PARTNER_SIGNUP_ENABLED', 'PARTNER_PAYOUTS_ENABLED', 'PARTNER_REPORTS_ENABLED'));

-- Insert default config flags
INSERT INTO public.system_config (key, value, description) VALUES
  ('PARTNER_SIGNUP_ENABLED', 'true'::jsonb, 'Allow new partner signups'),
  ('PARTNER_PAYOUTS_ENABLED', 'false'::jsonb, 'Enable payout execution (set true when ready)'),
  ('PARTNER_REPORTS_ENABLED', 'true'::jsonb, 'Enable scheduled report generation')
ON CONFLICT (key) DO NOTHING;

-- 6. Add data integrity constraint for commission amounts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_commission_non_negative'
  ) THEN
    ALTER TABLE public.partner_commissions 
      ADD CONSTRAINT check_commission_non_negative CHECK (net_amount >= 0);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 7. Create function to calculate partner risk level from score
CREATE OR REPLACE FUNCTION public.calculate_risk_level(p_risk_score INTEGER)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  IF p_risk_score >= 60 THEN
    RETURN 'high';
  ELSIF p_risk_score >= 30 THEN
    RETURN 'medium';
  ELSE
    RETURN 'low';
  END IF;
END;
$$;

-- 8. Create function to update partner risk and auto-suspend if needed
CREATE OR REPLACE FUNCTION public.update_partner_risk(
  p_partner_id UUID,
  p_score_delta INTEGER,
  p_reason TEXT DEFAULT NULL
)
RETURNS TABLE(new_score INTEGER, new_level TEXT, was_suspended BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_score INTEGER;
  v_new_score INTEGER;
  v_new_level TEXT;
  v_was_suspended BOOLEAN := false;
  v_current_status TEXT;
BEGIN
  -- Get current score and status
  SELECT risk_score, partner_status INTO v_current_score, v_current_status
  FROM partners WHERE id = p_partner_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Calculate new score (minimum 0)
  v_new_score := GREATEST(0, COALESCE(v_current_score, 0) + p_score_delta);
  v_new_level := calculate_risk_level(v_new_score);
  
  -- Update partner
  UPDATE partners
  SET risk_score = v_new_score,
      risk_level = v_new_level
  WHERE id = p_partner_id;
  
  -- Auto-suspend if high risk and not already suspended
  IF v_new_level = 'high' AND v_current_status != 'suspended' THEN
    UPDATE partners
    SET partner_status = 'suspended',
        has_fraud_flag = true,
        fraud_notes = COALESCE(fraud_notes, '') || E'\n[' || to_char(now(), 'YYYY-MM-DD HH24:MI') || '] Auto-suspended: ' || COALESCE(p_reason, 'High risk score threshold exceeded')
    WHERE id = p_partner_id;
    
    -- Disable report schedules
    UPDATE partner_scheduled_reports
    SET is_active = false
    WHERE partner_id = p_partner_id;
    
    -- Log audit event
    INSERT INTO partner_audit_logs (partner_id, action, resource_type, new_value)
    VALUES (p_partner_id, 'auto_suspended_fraud', 'partner', 
      jsonb_build_object('risk_score', v_new_score, 'reason', COALESCE(p_reason, 'High risk threshold')));
    
    -- Create critical notification
    INSERT INTO notifications (severity, category, title, details, resource_type, resource_id)
    VALUES ('critical', 'fraud', 'Partner auto-suspended for fraud', 
      'Partner ID: ' || p_partner_id::TEXT || '. Reason: ' || COALESCE(p_reason, 'High risk score threshold exceeded'),
      'partner', p_partner_id);
    
    v_was_suspended := true;
  END IF;
  
  new_score := v_new_score;
  new_level := v_new_level;
  was_suspended := v_was_suspended;
  RETURN NEXT;
END;
$$;

-- 9. Create function to get unresolved notification count
CREATE OR REPLACE FUNCTION public.get_unresolved_notification_count()
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM notifications
  WHERE resolved_at IS NULL;
$$;

-- 10. Create function to get critical notification count
CREATE OR REPLACE FUNCTION public.get_critical_notification_count()
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM notifications
  WHERE resolved_at IS NULL AND severity = 'critical';
$$;

-- 11. Create index for faster notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_unresolved 
  ON public.notifications (severity, created_at DESC) 
  WHERE resolved_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_category 
  ON public.notifications (category, created_at DESC);

-- 12. Create index for partner risk queries
CREATE INDEX IF NOT EXISTS idx_partners_risk_level 
  ON public.partners (risk_level) 
  WHERE risk_level IN ('medium', 'high');

CREATE INDEX IF NOT EXISTS idx_partners_fraud_flag 
  ON public.partners (has_fraud_flag) 
  WHERE has_fraud_flag = true;
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
