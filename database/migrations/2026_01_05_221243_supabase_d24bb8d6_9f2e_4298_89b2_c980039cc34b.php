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
-- Create agent_categories table
CREATE TABLE public.agent_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agent_categories ENABLE ROW LEVEL SECURITY;

-- Allow public read access (categories are public)
CREATE POLICY "Categories are viewable by everyone" 
ON public.agent_categories 
FOR SELECT 
USING (true);

-- Admin-only write access (based on admin_users table)
CREATE POLICY "Admins can manage categories" 
ON public.agent_categories 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.id = auth.uid()
  )
);

-- Seed with existing categories
INSERT INTO public.agent_categories (name, display_order) VALUES
  ('Admin', 1),
  ('Communication', 2),
  ('Content', 3),
  ('Data and Analytics', 4),
  ('Finance', 5),
  ('General', 6),
  ('Growth', 7),
  ('Operations', 8),
  ('Personal', 9),
  ('Sales', 10),
  ('Software', 11),
  ('Support', 12),
  ('Tech', 13);
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
