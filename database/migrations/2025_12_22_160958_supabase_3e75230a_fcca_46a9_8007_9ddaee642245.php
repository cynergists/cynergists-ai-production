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
-- Create function to handle new user profile creation on signup
-- This runs server-side with elevated privileges, ensuring proper validation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile with data from auth.users metadata
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
    CASE 
      WHEN NEW.raw_user_meta_data->>'user_type' = 'partner' THEN 'pending'::user_status
      ELSE 'active'::user_status
    END
  );
  
  -- Insert role based on user_type metadata
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    CASE 
      WHEN NEW.raw_user_meta_data->>'user_type' = 'partner' THEN 'partner'::app_role
      ELSE 'client'::app_role
    END
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users to auto-create profile and role
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Remove client-side INSERT policies for profiles since trigger handles this now
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Add RLS policy for service role to manage profiles (trigger runs as service role)
DROP POLICY IF EXISTS "Service role can manage all profiles" ON public.profiles;
CREATE POLICY "Service role can manage all profiles"
ON public.profiles
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Ensure user_roles has proper policies - users shouldn't be able to insert their own roles
DROP POLICY IF EXISTS "Users can insert own roles" ON public.user_roles;

-- Add service role policy for user_roles if not exists
DROP POLICY IF EXISTS "Service role can manage all roles" ON public.user_roles;
CREATE POLICY "Service role can manage all roles"
ON public.user_roles
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Create analytics rate limiting table
CREATE TABLE IF NOT EXISTS public.analytics_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  request_count integer NOT NULL DEFAULT 1,
  window_start timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(ip_address)
);

-- Enable RLS on rate limits table
ALTER TABLE public.analytics_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service role can access rate limits table
CREATE POLICY "Service role only - analytics_rate_limits"
ON public.analytics_rate_limits
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
