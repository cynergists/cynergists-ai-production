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
-- Create enum for agreement status
CREATE TYPE public.agreement_status AS ENUM ('draft', 'sent', 'viewed', 'signed', 'expired', 'cancelled');

-- Create agreements table
CREATE TABLE public.agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    plan_name TEXT NOT NULL,
    plan_price DECIMAL(10,2) NOT NULL,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    client_company TEXT,
    signer_name TEXT,
    signature TEXT,
    signed_at TIMESTAMP WITH TIME ZONE,
    signed_ip TEXT,
    token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
    status agreement_status NOT NULL DEFAULT 'draft',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create agreement_sections table for initials tracking
CREATE TABLE public.agreement_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agreement_id UUID REFERENCES public.agreements(id) ON DELETE CASCADE NOT NULL,
    section_key TEXT NOT NULL,
    section_title TEXT NOT NULL,
    initials TEXT,
    initialed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create agreement_activity table for audit trail
CREATE TABLE public.agreement_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agreement_id UUID REFERENCES public.agreements(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL,
    details JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin_users table for admin access
CREATE TABLE public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agreement_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agreement_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Agreements: Allow public read via token (for signing)
CREATE POLICY "Anyone can view agreements via token"
ON public.agreements
FOR SELECT
USING (true);

-- Agreements: Allow public update for signing (via token validation in app)
CREATE POLICY "Anyone can update agreements for signing"
ON public.agreements
FOR UPDATE
USING (true);

-- Agreements: Allow insert (from edge function)
CREATE POLICY "Allow insert agreements"
ON public.agreements
FOR INSERT
WITH CHECK (true);

-- Agreement sections: Allow public access for signing flow
CREATE POLICY "Anyone can view agreement sections"
ON public.agreement_sections
FOR SELECT
USING (true);

CREATE POLICY "Anyone can update agreement sections"
ON public.agreement_sections
FOR UPDATE
USING (true);

CREATE POLICY "Allow insert agreement sections"
ON public.agreement_sections
FOR INSERT
WITH CHECK (true);

-- Agreement activity: Allow insert for logging
CREATE POLICY "Allow insert activity"
ON public.agreement_activity
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view activity"
ON public.agreement_activity
FOR SELECT
USING (true);

-- Admin users: Public select for validation
CREATE POLICY "Anyone can view admin users"
ON public.admin_users
FOR SELECT
USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for agreements updated_at
CREATE TRIGGER update_agreements_updated_at
BEFORE UPDATE ON public.agreements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial admin user
INSERT INTO public.admin_users (email, name) VALUES ('david@cynergists.com', 'David');
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
