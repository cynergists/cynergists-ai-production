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
-- Step 5: Attribution, Referrals Enhancement, and Rate Limiting

-- Add blocked field to attribution_events
ALTER TABLE attribution_events 
ADD COLUMN IF NOT EXISTS blocked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS block_reason TEXT;

-- Add missing fields to referrals table
ALTER TABLE referrals
ADD COLUMN IF NOT EXISTS duplicate BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS needs_approval BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS event_type TEXT DEFAULT 'form_submit';

-- Add missing fields to partner_deals table
ALTER TABLE partner_deals
ADD COLUMN IF NOT EXISTS client_phone TEXT,
ADD COLUMN IF NOT EXISTS client_company TEXT,
ADD COLUMN IF NOT EXISTS timeline JSONB DEFAULT '[]'::jsonb;

-- Create rate limiting table for referral form submissions
CREATE TABLE IF NOT EXISTS referral_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  partner_slug TEXT,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT now(),
  blocked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for rate limiting lookups
CREATE INDEX IF NOT EXISTS idx_referral_rate_limits_ip ON referral_rate_limits(ip_address);
CREATE INDEX IF NOT EXISTS idx_referral_rate_limits_slug ON referral_rate_limits(partner_slug);
CREATE INDEX IF NOT EXISTS idx_referral_rate_limits_window ON referral_rate_limits(window_start);

-- Create index for referral deduplication lookups
CREATE INDEX IF NOT EXISTS idx_referrals_dedupe ON referrals(partner_id, lead_email, created_at);
CREATE INDEX IF NOT EXISTS idx_referrals_phone_dedupe ON referrals(partner_id, lead_phone, created_at);

-- Create index for deal matching
CREATE INDEX IF NOT EXISTS idx_partner_deals_email ON partner_deals(client_email);
CREATE INDEX IF NOT EXISTS idx_partner_deals_phone ON partner_deals(client_phone);
CREATE INDEX IF NOT EXISTS idx_partner_deals_company ON partner_deals(client_company);

-- Enable RLS on referral_rate_limits
ALTER TABLE referral_rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS for referral_rate_limits - service role only
CREATE POLICY "Service role manages rate limits"
ON referral_rate_limits
FOR ALL
USING (true)
WITH CHECK (true);

-- Function to normalize phone numbers (digits only)
CREATE OR REPLACE FUNCTION normalize_phone(phone TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  IF phone IS NULL THEN
    RETURN NULL;
  END IF;
  RETURN regexp_replace(phone, '[^0-9]', '', 'g');
END;
$$;

-- Function to check rate limit
CREATE OR REPLACE FUNCTION check_referral_rate_limit(p_ip_address TEXT, p_partner_slug TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ip_count INTEGER;
  slug_count INTEGER;
  v_blocked_until TIMESTAMPTZ;
  one_hour_ago TIMESTAMPTZ := now() - interval '1 hour';
BEGIN
  -- Check if IP is blocked
  SELECT blocked_until INTO v_blocked_until
  FROM referral_rate_limits
  WHERE ip_address = p_ip_address AND blocked_until > now()
  LIMIT 1;
  
  IF v_blocked_until IS NOT NULL THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'ip_blocked', 'blocked_until', v_blocked_until);
  END IF;
  
  -- Count IP requests in last hour
  SELECT COALESCE(SUM(request_count), 0) INTO ip_count
  FROM referral_rate_limits
  WHERE ip_address = p_ip_address AND window_start > one_hour_ago;
  
  IF ip_count >= 10 THEN
    -- Block IP for 1 hour
    INSERT INTO referral_rate_limits (ip_address, partner_slug, blocked_until)
    VALUES (p_ip_address, p_partner_slug, now() + interval '1 hour');
    RETURN jsonb_build_object('allowed', false, 'reason', 'ip_rate_limit');
  END IF;
  
  -- Count partner slug requests in last hour
  SELECT COALESCE(SUM(request_count), 0) INTO slug_count
  FROM referral_rate_limits
  WHERE partner_slug = p_partner_slug AND window_start > one_hour_ago;
  
  IF slug_count >= 50 THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'partner_rate_limit');
  END IF;
  
  -- Record this request
  INSERT INTO referral_rate_limits (ip_address, partner_slug, request_count, window_start)
  VALUES (p_ip_address, p_partner_slug, 1, now());
  
  RETURN jsonb_build_object('allowed', true);
END;
$$;

-- Function to find duplicate referral within 30 days
CREATE OR REPLACE FUNCTION find_duplicate_referral(p_partner_id UUID, p_email TEXT, p_phone TEXT)
RETURNS TABLE(referral_id UUID, deal_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT r.id, r.deal_id
  FROM referrals r
  WHERE r.partner_id = p_partner_id
    AND r.created_at > now() - interval '30 days'
    AND (
      (p_email IS NOT NULL AND LOWER(r.lead_email) = LOWER(p_email))
      OR (p_phone IS NOT NULL AND normalize_phone(r.lead_phone) = normalize_phone(p_phone) AND normalize_phone(p_phone) != '')
    )
  ORDER BY r.created_at DESC
  LIMIT 1;
END;
$$;

-- Function to find matching deal
CREATE OR REPLACE FUNCTION find_matching_deal(p_email TEXT, p_phone TEXT, p_company TEXT)
RETURNS TABLE(deal_id UUID, match_type TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Priority 1: Email match
  IF p_email IS NOT NULL AND p_email != '' THEN
    RETURN QUERY
    SELECT d.id, 'email'::TEXT
    FROM partner_deals d
    WHERE LOWER(d.client_email) = LOWER(p_email)
    LIMIT 1;
    
    IF FOUND THEN RETURN; END IF;
  END IF;
  
  -- Priority 2: Phone match
  IF p_phone IS NOT NULL AND normalize_phone(p_phone) != '' THEN
    RETURN QUERY
    SELECT d.id, 'phone'::TEXT
    FROM partner_deals d
    WHERE normalize_phone(d.client_phone) = normalize_phone(p_phone)
      AND d.client_phone IS NOT NULL
    LIMIT 1;
    
    IF FOUND THEN RETURN; END IF;
  END IF;
  
  -- Priority 3: Company match
  IF p_company IS NOT NULL AND p_company != '' THEN
    RETURN QUERY
    SELECT d.id, 'company'::TEXT
    FROM partner_deals d
    WHERE LOWER(d.client_company) = LOWER(p_company)
      AND d.client_company IS NOT NULL AND d.client_company != ''
    LIMIT 1;
  END IF;
END;
$$;

-- Function to append timeline entry to deal
CREATE OR REPLACE FUNCTION append_deal_timeline(p_deal_id UUID, p_entry JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE partner_deals
  SET timeline = COALESCE(timeline, '[]'::jsonb) || p_entry
  WHERE id = p_deal_id;
END;
$$;

-- Update RLS for referrals - partners can view their own
DROP POLICY IF EXISTS "Partners can view own referrals" ON referrals;
CREATE POLICY "Partners can view own referrals"
ON referrals FOR SELECT
USING (
  partner_id IN (
    SELECT partner_id FROM partner_users WHERE user_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin')
);

-- Admins can manage all referrals
DROP POLICY IF EXISTS "Admins can manage all referrals" ON referrals;
CREATE POLICY "Admins can manage all referrals"
ON referrals FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Update RLS for partner_deals - partners can view their own
DROP POLICY IF EXISTS "Partners can view own deals" ON partner_deals;
CREATE POLICY "Partners can view own deals"
ON partner_deals FOR SELECT
USING (
  partner_id IN (
    SELECT partner_id FROM partner_users WHERE user_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin')
);

-- Admins can manage all deals
DROP POLICY IF EXISTS "Admins can manage all deals" ON partner_deals;
CREATE POLICY "Admins can manage all deals"
ON partner_deals FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Update RLS for attribution_events - admins only for viewing
DROP POLICY IF EXISTS "Admins can view attribution events" ON attribution_events;
CREATE POLICY "Admins can view attribution events"
ON attribution_events FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Clean up old rate limit entries (run periodically)
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM referral_rate_limits
  WHERE window_start < now() - interval '24 hours'
    AND (blocked_until IS NULL OR blocked_until < now());
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
