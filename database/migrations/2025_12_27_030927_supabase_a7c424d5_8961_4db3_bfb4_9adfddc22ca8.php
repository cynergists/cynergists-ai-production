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
-- Create sales_reps table for managing sales representatives
CREATE TABLE public.sales_reps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  title TEXT,
  commission_rate NUMERIC DEFAULT 0,
  total_clients INTEGER DEFAULT 0,
  monthly_revenue NUMERIC DEFAULT 0,
  hire_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.sales_reps ENABLE ROW LEVEL SECURITY;

-- Create policy for service role only (admin access via edge functions)
CREATE POLICY "Service role only - sales_reps"
ON public.sales_reps
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_sales_reps_updated_at
BEFORE UPDATE ON public.sales_reps
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
