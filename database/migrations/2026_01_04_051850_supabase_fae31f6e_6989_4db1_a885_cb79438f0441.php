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
-- Create portal_tenants table for multi-tenant customer portals
CREATE TABLE public.portal_tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  company_name TEXT NOT NULL,
  subdomain TEXT UNIQUE NOT NULL,
  is_temp_subdomain BOOLEAN DEFAULT true,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#22c55e',
  settings JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  onboarding_completed_at TIMESTAMPTZ
);

-- Create index for subdomain lookups (most common query)
CREATE INDEX idx_portal_tenants_subdomain ON public.portal_tenants(subdomain);
CREATE INDEX idx_portal_tenants_user_id ON public.portal_tenants(user_id);

-- Enable RLS
ALTER TABLE public.portal_tenants ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own tenant"
  ON public.portal_tenants FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tenant"
  ON public.portal_tenants FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all tenants"
  ON public.portal_tenants FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role full access - portal_tenants"
  ON public.portal_tenants FOR ALL
  USING (auth.role() = 'service_role'::text)
  WITH CHECK (auth.role() = 'service_role'::text);

-- Function to generate temporary subdomain
CREATE OR REPLACE FUNCTION public.generate_temp_subdomain()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN 'tmp-' || substr(gen_random_uuid()::text, 1, 8);
END;
$$;

-- Function to check subdomain availability
CREATE OR REPLACE FUNCTION public.is_subdomain_available(subdomain_input TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check reserved words
  IF subdomain_input IN ('www', 'app', 'api', 'admin', 'portal', 'mail', 'ftp', 'help', 'support', 'billing', 'auth', 'login', 'signup', 'register', 'dashboard', 'account', 'settings', 'tmp') THEN
    RETURN FALSE;
  END IF;
  
  -- Check minimum length
  IF length(subdomain_input) < 3 THEN
    RETURN FALSE;
  END IF;
  
  -- Check if exists
  RETURN NOT EXISTS (
    SELECT 1 FROM public.portal_tenants WHERE subdomain = subdomain_input
  );
END;
$$;

-- Function to get tenant by subdomain (public access for routing)
CREATE OR REPLACE FUNCTION public.get_tenant_by_subdomain(subdomain_input TEXT)
RETURNS TABLE(
  id UUID,
  company_name TEXT,
  subdomain TEXT,
  is_temp_subdomain BOOLEAN,
  logo_url TEXT,
  primary_color TEXT,
  settings JSONB,
  status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.company_name,
    t.subdomain,
    t.is_temp_subdomain,
    t.logo_url,
    t.primary_color,
    t.settings,
    t.status
  FROM public.portal_tenants t
  WHERE t.subdomain = subdomain_input
    AND t.status = 'active'
  LIMIT 1;
END;
$$;

-- Add tenant_id to agent_access for tenant isolation
ALTER TABLE public.agent_access ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.portal_tenants(id);

-- Add tenant_id to agent_conversations for tenant isolation  
ALTER TABLE public.agent_conversations ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.portal_tenants(id);

-- Add tenant_id to customer_subscriptions for tenant isolation
ALTER TABLE public.customer_subscriptions ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.portal_tenants(id);

-- Trigger for updated_at
CREATE TRIGGER update_portal_tenants_updated_at
  BEFORE UPDATE ON public.portal_tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
