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
-- Update handle_new_user function to:
-- 1. Set partners to 'active' status (not 'pending')
-- 2. Create a record in the partners table for partner signups

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    -- Partners are immediately active (no approval needed)
    user_status := 'active'::user_status;
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
  
  -- If partner signup, create partner record
  IF NEW.raw_user_meta_data->>'user_type' = 'partner' THEN
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
      agreement_signed_date
    )
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      NEW.email,
      NEW.raw_user_meta_data->>'phone',
      NEW.raw_user_meta_data->>'company_name',
      COALESCE(NEW.raw_user_meta_data->>'partner_type', 'sole_proprietor'),
      'active',
      true,
      CURRENT_DATE,
      COALESCE((NEW.raw_user_meta_data->>'agreement_signed')::boolean, false),
      CASE WHEN (NEW.raw_user_meta_data->>'agreement_signed')::boolean = true 
           THEN CURRENT_DATE 
           ELSE NULL 
      END
    );
  END IF;
  
  RETURN NEW;
END;
$function$;
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
