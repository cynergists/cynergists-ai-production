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
-- Create admin_approval_requests table
CREATE TABLE public.admin_approval_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  requester_email TEXT NOT NULL,
  requester_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  approval_token TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add index for faster lookups
CREATE INDEX idx_admin_approval_requests_user_id ON public.admin_approval_requests(user_id);
CREATE INDEX idx_admin_approval_requests_status ON public.admin_approval_requests(status);
CREATE INDEX idx_admin_approval_requests_token ON public.admin_approval_requests(approval_token);

-- Enable RLS
ALTER TABLE public.admin_approval_requests ENABLE ROW LEVEL SECURITY;

-- Only service role can manage approval requests
CREATE POLICY "Service role only - admin_approval_requests"
ON public.admin_approval_requests
FOR ALL
USING (auth.role() = 'service_role'::text)
WITH CHECK (auth.role() = 'service_role'::text);

-- Approved admins can view approval requests
CREATE POLICY "Approved admins can view approval requests"
ON public.admin_approval_requests
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.status = 'active'
  )
);

-- Add updated_at trigger
CREATE TRIGGER update_admin_approval_requests_updated_at
  BEFORE UPDATE ON public.admin_approval_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Modify handle_new_user function to detect @cynergists.com emails
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  is_cynergists_email BOOLEAN;
  user_status user_status;
  user_role app_role;
BEGIN
  -- Check if email ends with @cynergists.com (case-insensitive)
  is_cynergists_email := LOWER(NEW.email) LIKE '%@cynergists.com';
  
  -- Determine status and role based on email domain and user_type
  IF is_cynergists_email THEN
    -- Cynergists emails get admin role with pending status
    user_status := 'pending'::user_status;
    user_role := 'admin'::app_role;
  ELSIF NEW.raw_user_meta_data->>'user_type' = 'partner' THEN
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
  
  RETURN NEW;
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
