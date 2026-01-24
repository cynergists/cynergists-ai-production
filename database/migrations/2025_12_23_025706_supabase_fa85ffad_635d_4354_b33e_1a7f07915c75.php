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
-- Enum for agreement lifecycle states
CREATE TYPE public.agreement_lifecycle_status AS ENUM ('draft', 'published', 'sent', 'viewed', 'partially_signed', 'active', 'expired', 'terminated', 'cancelled');

-- Enum for signing field types
CREATE TYPE public.signing_field_type AS ENUM ('signature', 'initials', 'date', 'name', 'title', 'text', 'checkbox');

-- Enum for signer role
CREATE TYPE public.signer_role AS ENUM ('primary_signer', 'secondary_signer', 'company_rep', 'witness', 'approver');

-- MSA Template Versions table - stores all versions of MSA
CREATE TABLE public.msa_template_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.document_templates(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  content_hash TEXT NOT NULL,
  content TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMP WITH TIME ZONE,
  published_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  changelog TEXT,
  UNIQUE(template_id, version_number)
);

-- Signing field definitions for templates
CREATE TABLE public.template_signing_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_version_id UUID NOT NULL REFERENCES public.msa_template_versions(id) ON DELETE CASCADE,
  field_type signing_field_type NOT NULL,
  field_label TEXT NOT NULL,
  signer_role signer_role NOT NULL,
  page_number INTEGER NOT NULL DEFAULT 1,
  position_x DECIMAL NOT NULL DEFAULT 0,
  position_y DECIMAL NOT NULL DEFAULT 0,
  width DECIMAL NOT NULL DEFAULT 200,
  height DECIMAL NOT NULL DEFAULT 50,
  is_required BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Signer configuration for templates
CREATE TABLE public.template_signer_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_version_id UUID NOT NULL REFERENCES public.msa_template_versions(id) ON DELETE CASCADE,
  signer_role signer_role NOT NULL,
  display_name TEXT NOT NULL,
  signing_order INTEGER NOT NULL DEFAULT 1,
  is_required BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(template_version_id, signer_role)
);

-- Enhanced agreements table to reference specific MSA version
ALTER TABLE public.agreements 
  ADD COLUMN IF NOT EXISTS msa_version_id UUID REFERENCES public.msa_template_versions(id),
  ADD COLUMN IF NOT EXISTS content_hash TEXT,
  ADD COLUMN IF NOT EXISTS lifecycle_status TEXT DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS activated_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS terminated_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS termination_reason TEXT;

-- Signers for each agreement
CREATE TABLE public.agreement_signers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id UUID NOT NULL REFERENCES public.agreements(id) ON DELETE CASCADE,
  signer_role signer_role NOT NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  title TEXT,
  signing_order INTEGER NOT NULL DEFAULT 1,
  access_token TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  invited_at TIMESTAMP WITH TIME ZONE,
  viewed_at TIMESTAMP WITH TIME ZONE,
  signed_at TIMESTAMP WITH TIME ZONE,
  signature_data TEXT,
  signature_ip TEXT,
  signature_user_agent TEXT,
  declined_at TIMESTAMP WITH TIME ZONE,
  decline_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(agreement_id, signer_role)
);

-- Individual field values captured during signing
CREATE TABLE public.agreement_field_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id UUID NOT NULL REFERENCES public.agreements(id) ON DELETE CASCADE,
  signer_id UUID NOT NULL REFERENCES public.agreement_signers(id) ON DELETE CASCADE,
  field_id UUID NOT NULL REFERENCES public.template_signing_fields(id),
  field_value TEXT NOT NULL,
  captured_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT
);

-- Comprehensive audit log for agreements
CREATE TABLE public.agreement_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id UUID NOT NULL REFERENCES public.agreements(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('system', 'admin', 'customer', 'signer')),
  actor_id TEXT,
  actor_email TEXT,
  event_details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_msa_versions_template ON public.msa_template_versions(template_id);
CREATE INDEX idx_msa_versions_status ON public.msa_template_versions(status);
CREATE INDEX idx_template_fields_version ON public.template_signing_fields(template_version_id);
CREATE INDEX idx_agreement_signers_agreement ON public.agreement_signers(agreement_id);
CREATE INDEX idx_agreement_signers_token ON public.agreement_signers(access_token);
CREATE INDEX idx_agreement_field_values_agreement ON public.agreement_field_values(agreement_id);
CREATE INDEX idx_agreement_audit_log_agreement ON public.agreement_audit_log(agreement_id);
CREATE INDEX idx_agreement_audit_log_created ON public.agreement_audit_log(created_at DESC);

-- Enable RLS
ALTER TABLE public.msa_template_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_signing_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_signer_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agreement_signers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agreement_field_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agreement_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Service role only for admin operations
CREATE POLICY "Service role only - msa_template_versions" ON public.msa_template_versions
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role only - template_signing_fields" ON public.template_signing_fields
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role only - template_signer_config" ON public.template_signer_config
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role only - agreement_signers" ON public.agreement_signers
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role only - agreement_field_values" ON public.agreement_field_values
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role only - agreement_audit_log" ON public.agreement_audit_log
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- Function to generate content hash
CREATE OR REPLACE FUNCTION public.generate_content_hash(content TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN encode(sha256(content::bytea), 'hex');
END;
$$;

-- Function to log agreement events
CREATE OR REPLACE FUNCTION public.log_agreement_event(
  p_agreement_id UUID,
  p_event_type TEXT,
  p_actor_type TEXT,
  p_actor_id TEXT DEFAULT NULL,
  p_actor_email TEXT DEFAULT NULL,
  p_event_details JSONB DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.agreement_audit_log (
    agreement_id, event_type, actor_type, actor_id, actor_email,
    event_details, ip_address, user_agent
  ) VALUES (
    p_agreement_id, p_event_type, p_actor_type, p_actor_id, p_actor_email,
    p_event_details, p_ip_address, p_user_agent
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Function to check if all signers have signed
CREATE OR REPLACE FUNCTION public.check_agreement_fully_signed(p_agreement_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_unsigned_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_unsigned_count
  FROM public.agreement_signers
  WHERE agreement_id = p_agreement_id
    AND signed_at IS NULL
    AND declined_at IS NULL;
  
  RETURN v_unsigned_count = 0;
END;
$$;

-- Function to activate agreement after all signatures
CREATE OR REPLACE FUNCTION public.activate_agreement_if_complete(p_agreement_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.check_agreement_fully_signed(p_agreement_id) THEN
    UPDATE public.agreements
    SET lifecycle_status = 'active',
        activated_at = now(),
        status = 'signed'
    WHERE id = p_agreement_id
      AND lifecycle_status != 'active';
    
    -- Log the activation
    PERFORM public.log_agreement_event(
      p_agreement_id,
      'agreement_activated',
      'system',
      NULL,
      NULL,
      jsonb_build_object('activated_automatically', true)
    );
    
    RETURN true;
  END IF;
  
  RETURN false;
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
