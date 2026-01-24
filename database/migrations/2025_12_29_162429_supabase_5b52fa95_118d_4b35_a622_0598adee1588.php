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
-- Create enum for user types (classification, not permission)
CREATE TYPE public.user_type AS ENUM ('client', 'partner', 'employee', 'sales_rep', 'admin');

-- Create enum for access levels (permissions)
CREATE TYPE public.access_level AS ENUM ('admin', 'manager', 'standard', 'limited');

-- Create enum for 2FA status
CREATE TYPE public.two_factor_status AS ENUM ('disabled', 'enabled', 'required');

-- Create companies table for primary company linking
CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Companies RLS policies
CREATE POLICY "Admins can manage companies"
  ON public.companies
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view companies"
  ON public.companies
  FOR SELECT
  TO authenticated
  USING (true);

-- Add new fields to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS user_type public.user_type DEFAULT 'client',
  ADD COLUMN IF NOT EXISTS access_level public.access_level DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS primary_company_id uuid REFERENCES public.companies(id),
  ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'America/New_York',
  ADD COLUMN IF NOT EXISTS two_factor_status public.two_factor_status DEFAULT 'disabled',
  ADD COLUMN IF NOT EXISTS last_login timestamp with time zone,
  ADD COLUMN IF NOT EXISTS created_by uuid,
  -- Client-specific fields
  ADD COLUMN IF NOT EXISTS subscription_status text,
  ADD COLUMN IF NOT EXISTS contract_signed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS contract_signed_date date,
  -- Partner-specific fields
  ADD COLUMN IF NOT EXISTS commission_rate numeric,
  ADD COLUMN IF NOT EXISTS agreement_status text,
  ADD COLUMN IF NOT EXISTS total_revenue_influenced numeric DEFAULT 0,
  -- Sales Rep specific fields
  ADD COLUMN IF NOT EXISTS commission_structure text,
  ADD COLUMN IF NOT EXISTS revenue_attributed numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS hire_date date,
  ADD COLUMN IF NOT EXISTS rep_status text DEFAULT 'active',
  -- Employee specific fields
  ADD COLUMN IF NOT EXISTS start_date date,
  ADD COLUMN IF NOT EXISTS employment_type text;

-- Create login history table for tracking login events
CREATE TABLE public.login_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on login_history
ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;

-- Login history RLS - only admins can view, system can insert
CREATE POLICY "Admins can view login history"
  ON public.login_history
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can manage login history"
  ON public.login_history
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Create associated_accounts junction table for Partner and Sales Rep multi-company links
CREATE TABLE public.user_associated_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, company_id)
);

-- Enable RLS on user_associated_accounts
ALTER TABLE public.user_associated_accounts ENABLE ROW LEVEL SECURITY;

-- Associated accounts RLS
CREATE POLICY "Admins can manage associated accounts"
  ON public.user_associated_accounts
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own associated accounts"
  ON public.user_associated_accounts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger for companies updated_at
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert "Individual" as a default company option
INSERT INTO public.companies (id, name) VALUES 
  ('00000000-0000-0000-0000-000000000000', 'Individual')
ON CONFLICT DO NOTHING;
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
