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
-- Create payment settings table for storing payment mode configuration
CREATE TABLE public.payment_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_mode VARCHAR(20) NOT NULL DEFAULT 'sandbox' CHECK (payment_mode IN ('sandbox', 'production')),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can view payment settings
CREATE POLICY "Admins can view payment settings"
ON public.payment_settings
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can update payment settings
CREATE POLICY "Admins can update payment settings"
ON public.payment_settings
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can insert payment settings
CREATE POLICY "Admins can insert payment settings"
ON public.payment_settings
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Insert default setting (sandbox mode)
INSERT INTO public.payment_settings (payment_mode) VALUES ('sandbox');

-- Create a function to get the current payment mode (for use in edge functions)
CREATE OR REPLACE FUNCTION public.get_payment_mode()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT payment_mode FROM public.payment_settings LIMIT 1
$$;
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
