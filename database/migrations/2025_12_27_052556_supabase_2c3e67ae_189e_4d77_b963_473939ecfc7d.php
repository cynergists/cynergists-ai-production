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
-- Create partner_view_preferences table (same schema as client_view_preferences)
CREATE TABLE public.partner_view_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  column_order TEXT[] DEFAULT ARRAY['name', 'email', 'phone', 'company_name', 'status', 'partnership_interest', 'referral_volume', 'created_at']::TEXT[],
  hidden_columns TEXT[] DEFAULT '{}'::TEXT[],
  column_widths JSONB DEFAULT '{}'::JSONB,
  sort_column TEXT DEFAULT 'created_at'::TEXT,
  sort_direction TEXT DEFAULT 'desc'::TEXT,
  active_filters JSONB DEFAULT '{}'::JSONB,
  rows_per_page INTEGER DEFAULT 50,
  saved_views JSONB DEFAULT '[]'::JSONB,
  active_view_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.partner_view_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies - users can only access their own preferences
CREATE POLICY "Users can view own preferences" 
ON public.partner_view_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" 
ON public.partner_view_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" 
ON public.partner_view_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences" 
ON public.partner_view_preferences 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create unique index on user_id
CREATE UNIQUE INDEX partner_view_preferences_user_id_idx ON public.partner_view_preferences(user_id);

-- Create trigger for auto-updating updated_at
CREATE TRIGGER update_partner_view_preferences_updated_at
BEFORE UPDATE ON public.partner_view_preferences
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
