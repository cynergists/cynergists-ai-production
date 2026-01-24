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
-- Create staff status enum
CREATE TYPE public.staff_status AS ENUM ('active', 'inactive');

-- Create staff table
CREATE TABLE public.staff (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT,
  status staff_status NOT NULL DEFAULT 'active',
  start_date DATE,
  end_date DATE,
  hourly_pay NUMERIC(10,2),
  hours_per_week NUMERIC(5,2),
  monthly_pay NUMERIC(10,2),
  
  -- Contact details
  email TEXT,
  phone TEXT,
  city TEXT,
  country TEXT,
  
  -- Banking details
  account_type TEXT,
  bank_name TEXT,
  account_number TEXT,
  routing_number TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- Service role only policy (admin access via edge functions)
CREATE POLICY "Service role only - staff"
ON public.staff
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Create trigger for updated_at
CREATE TRIGGER update_staff_updated_at
BEFORE UPDATE ON public.staff
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create hours_worked table to track hours per pay period
CREATE TABLE public.staff_hours (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  hours_worked NUMERIC(6,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on hours table
ALTER TABLE public.staff_hours ENABLE ROW LEVEL SECURITY;

-- Service role only policy for hours
CREATE POLICY "Service role only - staff_hours"
ON public.staff_hours
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Create trigger for updated_at on hours
CREATE TRIGGER update_staff_hours_updated_at
BEFORE UPDATE ON public.staff_hours
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
