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
-- Create partner_settings table for global partner discount configuration
CREATE TABLE public.partner_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  global_discount_percent numeric NOT NULL DEFAULT 0 CHECK (global_discount_percent >= 0 AND global_discount_percent <= 100),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.partner_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies - admins can manage, partners can read
CREATE POLICY "Admins can manage partner settings"
  ON public.partner_settings
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Partners can view partner settings"
  ON public.partner_settings
  FOR SELECT
  USING (has_role(auth.uid(), 'partner'::app_role));

CREATE POLICY "Service role full access - partner_settings"
  ON public.partner_settings
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Insert default settings row
INSERT INTO public.partner_settings (global_discount_percent) VALUES (20);

-- Add new columns to portal_available_agents for richer agent data
ALTER TABLE public.portal_available_agents
  ADD COLUMN IF NOT EXISTS perfect_for jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS integrations jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS long_description text;

-- Create trigger for updated_at on partner_settings
CREATE TRIGGER update_partner_settings_updated_at
  BEFORE UPDATE ON public.partner_settings
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
