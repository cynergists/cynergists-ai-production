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
-- Create enum types for calendar module
CREATE TYPE calendar_type AS ENUM ('individual', 'interview', 'partnership', 'podcast', 'shared');
CREATE TYPE calendar_status AS ENUM ('active', 'inactive', 'archived');

-- Create calendar_templates table
CREATE TABLE public.calendar_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_name TEXT NOT NULL,
  headline TEXT NOT NULL DEFAULT 'Schedule Your Call',
  subheadline TEXT,
  cta_text TEXT DEFAULT 'Book Now',
  background_image_url TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create calendars table
CREATE TABLE public.calendars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  calendar_name TEXT NOT NULL,
  owner TEXT,
  calendar_type calendar_type NOT NULL DEFAULT 'individual',
  slug TEXT NOT NULL UNIQUE,
  status calendar_status NOT NULL DEFAULT 'active',
  ghl_calendar_id TEXT,
  ghl_embed_code TEXT,
  template_id UUID REFERENCES public.calendar_templates(id),
  intended_use TEXT,
  internal_notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create calendar_view_preferences table
CREATE TABLE public.calendar_view_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  column_order TEXT[] DEFAULT ARRAY['calendar_name', 'owner', 'calendar_type', 'slug', 'status', 'public_url'],
  hidden_columns TEXT[] DEFAULT '{}',
  column_widths JSONB DEFAULT '{}',
  sort_column TEXT DEFAULT 'calendar_name',
  sort_direction TEXT DEFAULT 'asc',
  rows_per_page INTEGER DEFAULT 50,
  active_filters JSONB DEFAULT '{}',
  saved_views JSONB DEFAULT '[]',
  active_view_name TEXT,
  default_view_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.calendar_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_view_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies for calendar_templates (service role only for management, public read for active)
CREATE POLICY "Service role only - calendar_templates"
  ON public.calendar_templates
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Anyone can view calendar templates"
  ON public.calendar_templates
  FOR SELECT
  USING (true);

-- RLS policies for calendars (service role only)
CREATE POLICY "Service role only - calendars"
  ON public.calendars
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Anyone can view active calendars by slug"
  ON public.calendars
  FOR SELECT
  USING (status = 'active');

-- RLS policies for calendar_view_preferences (user's own preferences)
CREATE POLICY "Users can view own preferences"
  ON public.calendar_view_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON public.calendar_view_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON public.calendar_view_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences"
  ON public.calendar_view_preferences
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at triggers
CREATE TRIGGER update_calendar_templates_updated_at
  BEFORE UPDATE ON public.calendar_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_calendars_updated_at
  BEFORE UPDATE ON public.calendars
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_calendar_view_preferences_updated_at
  BEFORE UPDATE ON public.calendar_view_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index on slug for fast lookups
CREATE INDEX idx_calendars_slug ON public.calendars(slug);
CREATE INDEX idx_calendars_status ON public.calendars(status);
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
