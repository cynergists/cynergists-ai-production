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
-- Create document templates table for MSA and company policies
CREATE TABLE public.document_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    document_type text NOT NULL CHECK (document_type IN ('msa', 'terms', 'privacy')),
    title text NOT NULL,
    content text NOT NULL,
    version integer NOT NULL DEFAULT 1,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    created_by uuid REFERENCES auth.users(id),
    UNIQUE(document_type, version)
);

-- Create table for tracking sections in documents that require initials
CREATE TABLE public.document_template_sections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id uuid NOT NULL REFERENCES public.document_templates(id) ON DELETE CASCADE,
    section_key text NOT NULL,
    section_number integer NOT NULL,
    section_title text NOT NULL,
    section_summary text,
    requires_initials boolean NOT NULL DEFAULT false,
    display_order integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create table for tracking policy update emails sent to customers
CREATE TABLE public.policy_update_emails (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id uuid NOT NULL REFERENCES public.document_templates(id),
    document_type text NOT NULL,
    sent_by uuid REFERENCES auth.users(id),
    recipients_count integer NOT NULL DEFAULT 0,
    sent_at timestamp with time zone NOT NULL DEFAULT now(),
    status text NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'partial'))
);

-- Enable RLS
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_template_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_update_emails ENABLE ROW LEVEL SECURITY;

-- RLS policies for document_templates - service role only
CREATE POLICY "Service role only - document_templates"
ON public.document_templates
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- RLS policies for document_template_sections - service role only
CREATE POLICY "Service role only - document_template_sections"
ON public.document_template_sections
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- RLS policies for policy_update_emails - service role only
CREATE POLICY "Service role only - policy_update_emails"
ON public.policy_update_emails
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Create trigger for updated_at
CREATE TRIGGER update_document_templates_updated_at
BEFORE UPDATE ON public.document_templates
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
