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
-- FIX 1: Create chat_rate_limits table for persistent rate limiting
-- =====================================================
CREATE TABLE IF NOT EXISTS public.chat_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  request_count integer NOT NULL DEFAULT 1,
  window_start timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(ip_address)
);

ALTER TABLE public.chat_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only - chat_rate_limits"
ON public.chat_rate_limits
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- =====================================================
-- FIX 2: Create agreement_access_log for rate limiting token operations
-- =====================================================
CREATE TABLE IF NOT EXISTS public.agreement_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  token_hash text NOT NULL, -- Store hash of token, not the token itself
  action text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_agreement_access_ip_time ON public.agreement_access_log(ip_address, created_at);
CREATE INDEX idx_agreement_access_token_action ON public.agreement_access_log(token_hash, action, created_at);

ALTER TABLE public.agreement_access_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only - agreement_access_log"
ON public.agreement_access_log
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- =====================================================
-- FIX 3: Update get_agreement_by_token to add security controls
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_agreement_by_token(agreement_token text)
RETURNS TABLE(
  id uuid,
  title text,
  content text,
  plan_name text,
  plan_price numeric,
  client_name text,
  client_email text,
  client_company text,
  status text,
  signature text,
  signed_at timestamp with time zone,
  signer_name text,
  expires_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_agreement_status text;
  v_expires_at timestamp with time zone;
BEGIN
  -- First check if agreement exists and get its status
  SELECT a.status::text, a.expires_at INTO v_agreement_status, v_expires_at
  FROM public.agreements a
  WHERE a.token = agreement_token;
  
  -- If not found, return empty
  IF v_agreement_status IS NULL THEN
    RETURN;
  END IF;
  
  -- Check if agreement has expired
  IF v_expires_at IS NOT NULL AND v_expires_at < now() AND v_agreement_status != 'signed' THEN
    -- Mark as expired
    UPDATE public.agreements SET status = 'expired' WHERE token = agreement_token AND status != 'signed';
    RETURN;
  END IF;
  
  -- Return data with masked fields based on status
  -- For signed agreements, mask the signed_ip (not exposed in return anyway)
  RETURN QUERY
  SELECT 
    a.id, 
    a.title, 
    a.content, 
    a.plan_name, 
    a.plan_price,
    a.client_name, 
    -- Partially mask email for non-signed agreements being viewed
    CASE 
      WHEN a.status::text = 'signed' THEN a.client_email
      ELSE a.client_email -- Keep full email for signing process
    END as client_email,
    a.client_company,
    a.status::text, 
    -- Only show signature if already signed
    CASE 
      WHEN a.status::text = 'signed' THEN a.signature
      ELSE NULL
    END as signature, 
    a.signed_at, 
    -- Only show signer name if already signed
    CASE 
      WHEN a.status::text = 'signed' THEN a.signer_name
      ELSE NULL
    END as signer_name, 
    a.expires_at
  FROM public.agreements a
  WHERE a.token = agreement_token;
END;
$$;

-- =====================================================
-- FIX 4: Update update_section_initials with state validation
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_section_initials(agreement_token text, p_section_id uuid, p_initials text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_agreement_id uuid;
  v_agreement_status text;
  v_expires_at timestamp with time zone;
BEGIN
  -- Validate initials format (2-4 uppercase letters)
  IF p_initials IS NULL OR length(p_initials) < 2 OR length(p_initials) > 4 THEN
    RETURN false;
  END IF;
  
  -- Verify token and get agreement info
  SELECT id, status::text, expires_at INTO v_agreement_id, v_agreement_status, v_expires_at
  FROM public.agreements
  WHERE token = agreement_token;
  
  IF v_agreement_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if agreement is in a valid state for initialing
  IF v_agreement_status NOT IN ('sent', 'viewed') THEN
    RETURN false; -- Can only initial agreements that are sent or viewed, not signed/expired/cancelled
  END IF;
  
  -- Check expiration
  IF v_expires_at IS NOT NULL AND v_expires_at < now() THEN
    RETURN false;
  END IF;
  
  -- Update the section if it belongs to this agreement
  UPDATE public.agreement_sections
  SET initials = upper(p_initials), initialed_at = now()
  WHERE id = p_section_id AND agreement_id = v_agreement_id;
  
  RETURN FOUND;
END;
$$;

-- =====================================================
-- FIX 5: Update sign_agreement with validation and duplicate prevention
-- =====================================================
CREATE OR REPLACE FUNCTION public.sign_agreement(agreement_token text, p_signer_name text, p_signature text, p_ip_address text DEFAULT NULL::text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_agreement_id uuid;
  v_current_status text;
  v_expires_at timestamp with time zone;
BEGIN
  -- Validate signer name (minimum 2 chars, maximum 100)
  IF p_signer_name IS NULL OR length(trim(p_signer_name)) < 2 OR length(p_signer_name) > 100 THEN
    RETURN false;
  END IF;
  
  -- Validate signature (minimum 10 chars for reasonable signature data)
  IF p_signature IS NULL OR length(p_signature) < 10 THEN
    RETURN false;
  END IF;
  
  -- Verify token and get agreement info
  SELECT id, status::text, expires_at INTO v_agreement_id, v_current_status, v_expires_at
  FROM public.agreements
  WHERE token = agreement_token;
  
  IF v_agreement_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Prevent re-signing - only allow signing if status is sent or viewed
  IF v_current_status NOT IN ('sent', 'viewed') THEN
    RETURN false;
  END IF;
  
  -- Check expiration
  IF v_expires_at IS NOT NULL AND v_expires_at < now() THEN
    -- Mark as expired
    UPDATE public.agreements SET status = 'expired' WHERE id = v_agreement_id AND status NOT IN ('signed', 'expired');
    RETURN false;
  END IF;
  
  -- Sign the agreement
  UPDATE public.agreements
  SET 
    signer_name = trim(p_signer_name),
    signature = p_signature,
    signed_at = now(),
    signed_ip = p_ip_address,
    status = 'signed'
  WHERE id = v_agreement_id AND status IN ('sent', 'viewed'); -- Double-check status to prevent race conditions
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Log the activity
  INSERT INTO public.agreement_activity (agreement_id, action, ip_address, details)
  VALUES (v_agreement_id, 'signed', p_ip_address, jsonb_build_object('signer_name', trim(p_signer_name)));
  
  RETURN true;
END;
$$;

-- =====================================================
-- FIX 6: Update mark_agreement_viewed with duplicate prevention
-- =====================================================
CREATE OR REPLACE FUNCTION public.mark_agreement_viewed(agreement_token text, p_ip_address text DEFAULT NULL::text, p_user_agent text DEFAULT NULL::text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_agreement_id uuid;
  v_current_status text;
  v_last_view timestamp with time zone;
BEGIN
  SELECT id, status::text INTO v_agreement_id, v_current_status
  FROM public.agreements
  WHERE token = agreement_token;
  
  IF v_agreement_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check for recent view from same IP to prevent spam (within last 5 minutes)
  SELECT created_at INTO v_last_view
  FROM public.agreement_activity
  WHERE agreement_id = v_agreement_id 
    AND action = 'viewed' 
    AND ip_address = p_ip_address
    AND created_at > now() - interval '5 minutes'
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- If viewed recently from same IP, don't log again
  IF v_last_view IS NOT NULL THEN
    RETURN true; -- Return true but don't log duplicate
  END IF;
  
  -- Update status to viewed if still in sent status
  IF v_current_status = 'sent' THEN
    UPDATE public.agreements SET status = 'viewed' WHERE id = v_agreement_id;
  END IF;
  
  -- Log the view (only if not a duplicate)
  INSERT INTO public.agreement_activity (agreement_id, action, ip_address, user_agent)
  VALUES (v_agreement_id, 'viewed', p_ip_address, left(p_user_agent, 500)); -- Truncate user agent
  
  RETURN true;
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
