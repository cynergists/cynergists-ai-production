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
-- Fix overly permissive RLS policies
-- Drop existing permissive policies

DROP POLICY IF EXISTS "Anyone can view agreements via token" ON public.agreements;
DROP POLICY IF EXISTS "Anyone can update agreements for signing" ON public.agreements;
DROP POLICY IF EXISTS "Allow insert agreements" ON public.agreements;

DROP POLICY IF EXISTS "Anyone can view agreement sections" ON public.agreement_sections;
DROP POLICY IF EXISTS "Anyone can update agreement sections" ON public.agreement_sections;
DROP POLICY IF EXISTS "Allow insert agreement sections" ON public.agreement_sections;

DROP POLICY IF EXISTS "Anyone can view activity" ON public.agreement_activity;
DROP POLICY IF EXISTS "Allow insert activity" ON public.agreement_activity;

DROP POLICY IF EXISTS "Anyone can view admin users" ON public.admin_users;

-- Create service-role-only policies for sensitive tables
-- These tables should only be accessed via edge functions with service role

CREATE POLICY "Service role only - select" ON public.agreements
FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "Service role only - insert" ON public.agreements
FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role only - update" ON public.agreements
FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Service role only - select" ON public.agreement_sections
FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "Service role only - insert" ON public.agreement_sections
FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role only - update" ON public.agreement_sections
FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Service role only - select" ON public.agreement_activity
FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "Service role only - insert" ON public.agreement_activity
FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role only - select" ON public.admin_users
FOR SELECT USING (auth.role() = 'service_role');

-- Create RPC functions for public token-based access (these bypass RLS safely)

CREATE OR REPLACE FUNCTION public.get_agreement_by_token(agreement_token text)
RETURNS TABLE (
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
  signed_at timestamptz,
  signer_name text,
  expires_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id, title, content, plan_name, plan_price,
    client_name, client_email, client_company,
    status::text, signature, signed_at, signer_name, expires_at
  FROM public.agreements
  WHERE token = agreement_token;
$$;

CREATE OR REPLACE FUNCTION public.get_agreement_sections_by_token(agreement_token text)
RETURNS TABLE (
  id uuid,
  section_key text,
  section_title text,
  initials text,
  initialed_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.id, s.section_key, s.section_title, s.initials, s.initialed_at
  FROM public.agreement_sections s
  INNER JOIN public.agreements a ON a.id = s.agreement_id
  WHERE a.token = agreement_token;
$$;

CREATE OR REPLACE FUNCTION public.update_section_initials(
  agreement_token text,
  p_section_id uuid,
  p_initials text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_agreement_id uuid;
BEGIN
  -- Verify token and get agreement id
  SELECT id INTO v_agreement_id
  FROM public.agreements
  WHERE token = agreement_token;
  
  IF v_agreement_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Update the section if it belongs to this agreement
  UPDATE public.agreement_sections
  SET initials = p_initials, initialed_at = now()
  WHERE id = p_section_id AND agreement_id = v_agreement_id;
  
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.sign_agreement(
  agreement_token text,
  p_signer_name text,
  p_signature text,
  p_ip_address text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_agreement_id uuid;
BEGIN
  -- Verify token and get agreement id
  SELECT id INTO v_agreement_id
  FROM public.agreements
  WHERE token = agreement_token AND status != 'signed';
  
  IF v_agreement_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Sign the agreement
  UPDATE public.agreements
  SET 
    signer_name = p_signer_name,
    signature = p_signature,
    signed_at = now(),
    signed_ip = p_ip_address,
    status = 'signed'
  WHERE id = v_agreement_id;
  
  -- Log the activity
  INSERT INTO public.agreement_activity (agreement_id, action, ip_address, details)
  VALUES (v_agreement_id, 'signed', p_ip_address, jsonb_build_object('signer_name', p_signer_name));
  
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_agreement_viewed(agreement_token text, p_ip_address text DEFAULT NULL, p_user_agent text DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_agreement_id uuid;
  v_current_status text;
BEGIN
  SELECT id, status::text INTO v_agreement_id, v_current_status
  FROM public.agreements
  WHERE token = agreement_token;
  
  IF v_agreement_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Update status to viewed if still in sent status
  IF v_current_status = 'sent' THEN
    UPDATE public.agreements SET status = 'viewed' WHERE id = v_agreement_id;
  END IF;
  
  -- Log the view
  INSERT INTO public.agreement_activity (agreement_id, action, ip_address, user_agent)
  VALUES (v_agreement_id, 'viewed', p_ip_address, p_user_agent);
  
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
