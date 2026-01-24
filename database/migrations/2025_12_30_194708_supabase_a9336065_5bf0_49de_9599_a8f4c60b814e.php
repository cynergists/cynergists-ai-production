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
-- Step 4: Partner Signup Flow, Settings, and Activation Checklist

-- Add missing columns to partners table
ALTER TABLE partners ADD COLUMN IF NOT EXISTS tax_status TEXT DEFAULT 'not_started';
ALTER TABLE partners ADD COLUMN IF NOT EXISTS tax_rejection_reason TEXT;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS payout_status TEXT DEFAULT 'not_started';
ALTER TABLE partners ADD COLUMN IF NOT EXISTS payout_rejection_reason TEXT;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS fraud_notes TEXT;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS address_line1 TEXT;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS address_line2 TEXT;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'US';
ALTER TABLE partners ADD COLUMN IF NOT EXISTS w9_file_url TEXT;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS payout_provider TEXT DEFAULT 'pending';
ALTER TABLE partners ADD COLUMN IF NOT EXISTS payout_token_reference TEXT;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS payout_last4 TEXT;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS payout_bank_name TEXT;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS payout_account_type TEXT;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS payout_verified_at TIMESTAMPTZ;

-- Create storage bucket for partner documents (W-9s)
INSERT INTO storage.buckets (id, name, public)
VALUES ('partner-documents', 'partner-documents', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policy for partner documents - partners can upload to their own folder
CREATE POLICY "Partners can upload their own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'partner-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Partners can view their own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'partner-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all partner documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'partner-documents' 
  AND has_role(auth.uid(), 'admin')
);

-- Function to generate unique partner slug
CREATE OR REPLACE FUNCTION public.generate_partner_slug(p_first_name TEXT, p_last_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_slug TEXT;
  random_suffix TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Create base slug from names, removing non-alphanumeric characters
  base_slug := LOWER(REGEXP_REPLACE(COALESCE(p_first_name, '') || COALESCE(p_last_name, ''), '[^a-zA-Z0-9]', '', 'g'));
  
  -- If base_slug is empty, use 'partner'
  IF base_slug = '' THEN
    base_slug := 'partner';
  END IF;
  
  -- Generate unique slug with random suffix
  LOOP
    random_suffix := SUBSTR(MD5(RANDOM()::TEXT), 1, 6);
    final_slug := base_slug || '-' || random_suffix;
    
    -- Check if slug already exists
    IF NOT EXISTS (SELECT 1 FROM partners WHERE slug = final_slug) THEN
      RETURN final_slug;
    END IF;
    
    counter := counter + 1;
    IF counter > 10 THEN
      -- Fallback with timestamp
      RETURN base_slug || '-' || EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT;
    END IF;
  END LOOP;
END;
$$;

-- Function to check if partner profile is complete
CREATE OR REPLACE FUNCTION public.check_partner_profile_complete(_partner_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    COALESCE(first_name, '') != '' AND
    COALESCE(last_name, '') != '' AND
    COALESCE(phone, '') != ''
  FROM partners
  WHERE id = _partner_id;
$$;

-- Function to auto-update partner status based on activation criteria
CREATE OR REPLACE FUNCTION public.auto_update_partner_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Don't auto-change suspended partners
  IF NEW.partner_status = 'suspended' THEN
    RETURN NEW;
  END IF;
  
  -- Update profile_complete flag
  NEW.profile_complete := (
    COALESCE(NEW.first_name, '') != '' AND
    COALESCE(NEW.last_name, '') != '' AND
    COALESCE(NEW.phone, '') != ''
  );
  
  -- Check if all activation criteria are met
  IF NEW.email_verified = true AND
     NEW.profile_complete = true AND
     NEW.w9_status IN ('submitted', 'verified') AND
     NEW.payout_status = 'verified' AND
     NEW.has_fraud_flag = false THEN
    -- Auto-activate if all criteria met
    IF NEW.partner_status = 'pending' THEN
      NEW.partner_status := 'active';
    END IF;
  ELSIF NEW.partner_status = 'active' AND (
    NEW.profile_complete = false OR
    NEW.w9_status NOT IN ('submitted', 'verified') OR
    NEW.payout_status != 'verified' OR
    NEW.has_fraud_flag = true
  ) THEN
    -- Revert to pending if requirements no longer met (but not for email verification)
    NEW.partner_status := 'pending';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for auto-activation
DROP TRIGGER IF EXISTS partner_auto_activation ON partners;
CREATE TRIGGER partner_auto_activation
BEFORE UPDATE ON partners
FOR EACH ROW EXECUTE FUNCTION auto_update_partner_status();

-- Update handle_new_user function to set pending status, generate slug, and create partner_users link
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_cynergists_email BOOLEAN;
  user_status user_status;
  user_role app_role;
  generated_slug TEXT;
  new_partner_id UUID;
BEGIN
  -- Check if email ends with @cynergists.com (case-insensitive)
  is_cynergists_email := LOWER(NEW.email) LIKE '%@cynergists.com';
  
  -- Determine status and role based on email domain and user_type
  IF is_cynergists_email THEN
    -- Cynergists emails get admin role with pending status
    user_status := 'pending'::user_status;
    user_role := 'admin'::app_role;
  ELSIF NEW.raw_user_meta_data->>'user_type' = 'partner' THEN
    -- Partners start as pending (changed from active)
    user_status := 'pending'::user_status;
    user_role := 'partner'::app_role;
  ELSE
    user_status := 'active'::user_status;
    user_role := 'client'::app_role;
  END IF;

  -- Insert profile
  INSERT INTO public.profiles (
    user_id,
    email,
    first_name,
    last_name,
    company_name,
    phone,
    title,
    partnership_interest,
    referral_volume,
    status
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'company_name', ''),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'title',
    NEW.raw_user_meta_data->>'partnership_interest',
    NEW.raw_user_meta_data->>'referral_volume',
    user_status
  );
  
  -- Insert role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);
  
  -- If cynergists email, create approval request
  IF is_cynergists_email THEN
    INSERT INTO public.admin_approval_requests (
      user_id,
      requester_email,
      requester_name
    )
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(
        TRIM(COALESCE(NEW.raw_user_meta_data->>'first_name', '') || ' ' || COALESCE(NEW.raw_user_meta_data->>'last_name', '')),
        NEW.email
      )
    );
  END IF;
  
  -- If partner signup, create partner record with generated slug and partner_users link
  IF NEW.raw_user_meta_data->>'user_type' = 'partner' THEN
    -- Generate unique slug
    generated_slug := generate_partner_slug(
      NEW.raw_user_meta_data->>'first_name',
      NEW.raw_user_meta_data->>'last_name'
    );
    
    -- Create partner record with PENDING status
    INSERT INTO public.partners (
      linked_user_id,
      first_name,
      last_name,
      email,
      phone,
      company_name,
      partner_type,
      partner_status,
      portal_access_enabled,
      partner_start_date,
      agreement_signed,
      agreement_signed_date,
      slug,
      tax_status,
      payout_status,
      website
    )
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      NEW.email,
      NEW.raw_user_meta_data->>'phone',
      NEW.raw_user_meta_data->>'company_name',
      COALESCE(NEW.raw_user_meta_data->>'partner_type', 'referral'),
      'pending',  -- Always start as pending
      true,
      CURRENT_DATE,
      COALESCE((NEW.raw_user_meta_data->>'agreement_signed')::boolean, false),
      CASE WHEN (NEW.raw_user_meta_data->>'agreement_signed')::boolean = true 
           THEN CURRENT_DATE 
           ELSE NULL 
      END,
      generated_slug,
      'not_started',
      'not_started',
      NEW.raw_user_meta_data->>'website'
    )
    RETURNING id INTO new_partner_id;
    
    -- Create partner_users link with owner role
    INSERT INTO public.partner_users (user_id, partner_id, role)
    VALUES (NEW.id, new_partner_id, 'owner');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Function to log partner audit events
CREATE OR REPLACE FUNCTION public.log_partner_audit(
  p_partner_id UUID,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_old_value JSONB DEFAULT NULL,
  p_new_value JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.partner_audit_logs (
    partner_id,
    user_id,
    action,
    resource_type,
    resource_id,
    old_value,
    new_value
  )
  VALUES (
    p_partner_id,
    auth.uid(),
    p_action,
    p_resource_type,
    p_resource_id,
    p_old_value,
    p_new_value
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.generate_partner_slug(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_partner_profile_complete(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_partner_audit(UUID, TEXT, TEXT, UUID, JSONB, JSONB) TO authenticated;
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
