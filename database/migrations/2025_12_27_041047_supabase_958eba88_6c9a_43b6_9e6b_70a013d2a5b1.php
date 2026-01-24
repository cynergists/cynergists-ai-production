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
-- Create prospects table similar to clients but adapted for pre-signup leads
CREATE TABLE public.prospects (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  name_updated_at timestamp with time zone DEFAULT now(),
  name_updated_by text DEFAULT 'website',
  email text,
  email_updated_at timestamp with time zone DEFAULT now(),
  email_updated_by text DEFAULT 'website',
  phone text,
  phone_updated_at timestamp with time zone DEFAULT now(),
  phone_updated_by text DEFAULT 'website',
  company text,
  company_updated_at timestamp with time zone DEFAULT now(),
  company_updated_by text DEFAULT 'website',
  sales_rep text,
  sales_rep_updated_at timestamp with time zone DEFAULT now(),
  sales_rep_updated_by text DEFAULT 'website',
  partner_name text,
  partner_name_updated_at timestamp with time zone DEFAULT now(),
  partner_name_updated_by text DEFAULT 'website',
  tags text[] DEFAULT '{}',
  tags_updated_at timestamp with time zone DEFAULT now(),
  tags_updated_by text DEFAULT 'website',
  -- Prospect-specific status (different from client status)
  status text DEFAULT 'new',
  -- Interest/pipeline fields instead of payment fields
  interested_plan text,
  estimated_value numeric,
  lead_source text,
  -- Activity tracking
  last_activity timestamp with time zone,
  last_activity_updated_at timestamp with time zone,
  last_activity_updated_by text,
  last_contact timestamp with time zone,
  last_contact_updated_at timestamp with time zone,
  last_contact_updated_by text,
  next_meeting timestamp with time zone,
  next_meeting_updated_at timestamp with time zone,
  next_meeting_updated_by text,
  -- CRM integration
  ghl_contact_id text,
  ghl_synced_at timestamp with time zone,
  -- Notes
  notes text,
  -- Timestamps
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for service role only (same as clients)
CREATE POLICY "Service role only - prospects"
ON public.prospects
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Create prospect view preferences table
CREATE TABLE public.prospect_view_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  column_order text[] DEFAULT ARRAY['name', 'email', 'phone', 'status', 'interested_plan', 'estimated_value', 'lead_source', 'last_activity', 'last_contact', 'next_meeting', 'sales_rep', 'partner_name', 'tags'],
  hidden_columns text[] DEFAULT '{}',
  column_widths jsonb DEFAULT '{}',
  sort_column text DEFAULT 'name',
  sort_direction text DEFAULT 'asc',
  active_filters jsonb DEFAULT '{}',
  rows_per_page integer DEFAULT 50,
  saved_views jsonb DEFAULT '[]',
  active_view_name text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on prospect view preferences
ALTER TABLE public.prospect_view_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies for prospect view preferences
CREATE POLICY "Users can view own preferences"
ON public.prospect_view_preferences
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
ON public.prospect_view_preferences
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
ON public.prospect_view_preferences
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences"
ON public.prospect_view_preferences
FOR DELETE
USING (auth.uid() = user_id);
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
