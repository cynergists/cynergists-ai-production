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
-- =============================================
-- STEP 11: Scheduled Partner Reports Schema
-- =============================================

-- Update partner_scheduled_reports table with new columns
ALTER TABLE partner_scheduled_reports 
  ADD COLUMN IF NOT EXISTS report_type TEXT DEFAULT 'combined',
  ADD COLUMN IF NOT EXISTS format_pdf BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS format_csv BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS day_of_week INTEGER,
  ADD COLUMN IF NOT EXISTS day_of_month INTEGER,
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/Denver',
  ADD COLUMN IF NOT EXISTS include_statuses TEXT[] DEFAULT ARRAY['earned', 'payable', 'paid', 'clawed_back', 'disputed'],
  ADD COLUMN IF NOT EXISTS detail_level TEXT DEFAULT 'detailed',
  ADD COLUMN IF NOT EXISTS email_to TEXT;

-- Add constraint for day_of_week (1-7)
ALTER TABLE partner_scheduled_reports 
  DROP CONSTRAINT IF EXISTS partner_scheduled_reports_day_of_week_check;
ALTER TABLE partner_scheduled_reports 
  ADD CONSTRAINT partner_scheduled_reports_day_of_week_check 
  CHECK (day_of_week IS NULL OR (day_of_week >= 1 AND day_of_week <= 7));

-- Add constraint for day_of_month (1-28)
ALTER TABLE partner_scheduled_reports 
  DROP CONSTRAINT IF EXISTS partner_scheduled_reports_day_of_month_check;
ALTER TABLE partner_scheduled_reports 
  ADD CONSTRAINT partner_scheduled_reports_day_of_month_check 
  CHECK (day_of_month IS NULL OR (day_of_month >= 1 AND day_of_month <= 28));

-- Create report_runs table
CREATE TABLE IF NOT EXISTS report_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES partner_scheduled_reports(id) ON DELETE SET NULL,
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'generated',
  pdf_url TEXT,
  csv_commissions_url TEXT,
  csv_payouts_url TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add constraint for status
ALTER TABLE report_runs 
  DROP CONSTRAINT IF EXISTS report_runs_status_check;
ALTER TABLE report_runs 
  ADD CONSTRAINT report_runs_status_check 
  CHECK (status IN ('generating', 'generated', 'emailed', 'failed'));

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_report_runs_partner_id ON report_runs(partner_id);
CREATE INDEX IF NOT EXISTS idx_report_runs_report_id ON report_runs(report_id);
CREATE INDEX IF NOT EXISTS idx_report_runs_status ON report_runs(status);

-- Enable RLS
ALTER TABLE report_runs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for report_runs
DROP POLICY IF EXISTS "Partners can view own report runs" ON report_runs;
CREATE POLICY "Partners can view own report runs"
  ON report_runs FOR SELECT
  USING (partner_id IN (
    SELECT partner_id FROM partner_users WHERE user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Admins can manage all report runs" ON report_runs;
CREATE POLICY "Admins can manage all report runs"
  ON report_runs FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Service role access report_runs" ON report_runs;
CREATE POLICY "Service role access report_runs"
  ON report_runs FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Create storage bucket for partner reports
INSERT INTO storage.buckets (id, name, public)
VALUES ('partner-reports', 'partner-reports', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for partner-reports bucket
DROP POLICY IF EXISTS "partner_reports_select" ON storage.objects;
CREATE POLICY "partner_reports_select"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'partner-reports' 
    AND (storage.foldername(name))[1] IN (
      SELECT p.id::text FROM partners p
      JOIN partner_users pu ON pu.partner_id = p.id
      WHERE pu.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "partner_reports_admin_select" ON storage.objects;
CREATE POLICY "partner_reports_admin_select"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'partner-reports'
    AND has_role(auth.uid(), 'admin'::app_role)
  );

DROP POLICY IF EXISTS "partner_reports_service_insert" ON storage.objects;
CREATE POLICY "partner_reports_service_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'partner-reports'
    AND auth.role() = 'service_role'
  );

DROP POLICY IF EXISTS "partner_reports_service_delete" ON storage.objects;
CREATE POLICY "partner_reports_service_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'partner-reports'
    AND auth.role() = 'service_role'
  );

-- Function to calculate next run date based on cadence
CREATE OR REPLACE FUNCTION calculate_next_run_at(
  p_cadence TEXT,
  p_day_of_week INTEGER,
  p_day_of_month INTEGER,
  p_timezone TEXT DEFAULT 'America/Denver'
)
RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  v_now TIMESTAMPTZ;
  v_next TIMESTAMPTZ;
  v_local_now TIMESTAMP;
  v_target_dow INTEGER;
BEGIN
  v_now := now();
  v_local_now := v_now AT TIME ZONE p_timezone;
  
  CASE p_cadence
    WHEN 'weekly' THEN
      -- Find next occurrence of day_of_week
      v_target_dow := COALESCE(p_day_of_week, 1);
      v_next := date_trunc('day', v_local_now) + ((v_target_dow - EXTRACT(DOW FROM v_local_now) + 7)::INTEGER % 7) * INTERVAL '1 day';
      IF v_next <= v_local_now THEN
        v_next := v_next + INTERVAL '7 days';
      END IF;
      v_next := (v_next + INTERVAL '1 hour') AT TIME ZONE p_timezone; -- 01:00 AM
      
    WHEN 'biweekly' THEN
      v_target_dow := COALESCE(p_day_of_week, 1);
      v_next := date_trunc('day', v_local_now) + ((v_target_dow - EXTRACT(DOW FROM v_local_now) + 7)::INTEGER % 7) * INTERVAL '1 day';
      IF v_next <= v_local_now THEN
        v_next := v_next + INTERVAL '14 days';
      ELSE
        v_next := v_next + INTERVAL '7 days'; -- Start from next week, then add 14 days
      END IF;
      v_next := (v_next + INTERVAL '1 hour') AT TIME ZONE p_timezone;
      
    WHEN 'monthly' THEN
      -- Next month at day_of_month
      v_next := date_trunc('month', v_local_now) + INTERVAL '1 month' + (COALESCE(p_day_of_month, 1) - 1) * INTERVAL '1 day';
      IF v_next <= v_local_now THEN
        v_next := v_next + INTERVAL '1 month';
      END IF;
      v_next := (v_next + INTERVAL '1 hour') AT TIME ZONE p_timezone;
      
    WHEN 'quarterly' THEN
      -- Next quarter start + day_of_month
      v_next := date_trunc('quarter', v_local_now) + INTERVAL '3 months' + (COALESCE(p_day_of_month, 1) - 1) * INTERVAL '1 day';
      IF v_next <= v_local_now THEN
        v_next := v_next + INTERVAL '3 months';
      END IF;
      v_next := (v_next + INTERVAL '1 hour') AT TIME ZONE p_timezone;
      
    ELSE
      v_next := v_now + INTERVAL '7 days'; -- Default to weekly
  END CASE;
  
  RETURN v_next;
END;
$$;

-- Function to auto-disable reports when partner status changes
CREATE OR REPLACE FUNCTION auto_disable_partner_reports()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If partner becomes pending or suspended, disable all their report schedules
  IF NEW.partner_status IN ('pending', 'suspended') AND OLD.partner_status = 'active' THEN
    UPDATE partner_scheduled_reports
    SET is_active = false
    WHERE partner_id = NEW.id AND is_active = true;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for auto-disabling reports
DROP TRIGGER IF EXISTS trigger_auto_disable_partner_reports ON partners;
CREATE TRIGGER trigger_auto_disable_partner_reports
  AFTER UPDATE OF partner_status ON partners
  FOR EACH ROW
  EXECUTE FUNCTION auto_disable_partner_reports();
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
