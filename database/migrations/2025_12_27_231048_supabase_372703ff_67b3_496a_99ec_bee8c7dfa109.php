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
-- Create staff_type enum
CREATE TYPE public.staff_type AS ENUM ('operational', 'sales_rep', 'contractor', 'intern');

-- Create employment_type enum  
CREATE TYPE public.employment_type AS ENUM ('full_time', 'part_time', 'contractor', 'intern');

-- Create pay_type enum
CREATE TYPE public.pay_type AS ENUM ('hourly', 'salary', 'commission_only');

-- Create commission_type enum
CREATE TYPE public.commission_type AS ENUM ('percentage', 'flat_fee', 'tiered');

-- Add new columns to existing staff table
ALTER TABLE public.staff
  -- Identity fields
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS timezone text,
  
  -- Role & Employment fields
  ADD COLUMN IF NOT EXISTS staff_type staff_type NOT NULL DEFAULT 'operational',
  ADD COLUMN IF NOT EXISTS department text,
  ADD COLUMN IF NOT EXISTS manager_id uuid REFERENCES public.staff(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS employment_type employment_type DEFAULT 'full_time',
  ADD COLUMN IF NOT EXISTS termination_reason text,
  ADD COLUMN IF NOT EXISTS termination_notes text,
  
  -- Compensation fields - Internal
  ADD COLUMN IF NOT EXISTS pay_type pay_type DEFAULT 'hourly',
  ADD COLUMN IF NOT EXISTS salary numeric,
  ADD COLUMN IF NOT EXISTS expected_hours_week numeric,
  
  -- Compensation fields - Sales Rep specific
  ADD COLUMN IF NOT EXISTS commission_type commission_type,
  ADD COLUMN IF NOT EXISTS commission_percent numeric,
  ADD COLUMN IF NOT EXISTS quota numeric,
  ADD COLUMN IF NOT EXISTS commission_status text DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS total_clients integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS monthly_revenue numeric DEFAULT 0,
  
  -- Performance fields
  ADD COLUMN IF NOT EXISTS kpis jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS performance_status text DEFAULT 'on_track',
  ADD COLUMN IF NOT EXISTS last_review_date date,
  ADD COLUMN IF NOT EXISTS next_review_date date,
  ADD COLUMN IF NOT EXISTS training_completed jsonb DEFAULT '[]'::jsonb,
  
  -- System linkage
  ADD COLUMN IF NOT EXISTS portal_user_linked boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS primary_user_email text,
  
  -- Notes
  ADD COLUMN IF NOT EXISTS notes text;

-- Create index on staff_type for filtering
CREATE INDEX IF NOT EXISTS idx_staff_type ON public.staff(staff_type);
CREATE INDEX IF NOT EXISTS idx_staff_status ON public.staff(status);
CREATE INDEX IF NOT EXISTS idx_staff_manager ON public.staff(manager_id);

-- Migrate data from sales_reps to staff table
INSERT INTO public.staff (
  name,
  email,
  phone,
  title,
  status,
  staff_type,
  start_date,
  commission_type,
  commission_percent,
  total_clients,
  monthly_revenue,
  notes,
  created_at,
  updated_at
)
SELECT 
  name,
  email,
  phone,
  title,
  status::staff_status,
  'sales_rep'::staff_type,
  hire_date,
  'percentage'::commission_type,
  commission_rate,
  COALESCE(total_clients, 0),
  COALESCE(monthly_revenue, 0),
  notes,
  created_at,
  updated_at
FROM public.sales_reps
WHERE NOT EXISTS (
  SELECT 1 FROM public.staff s 
  WHERE s.email = sales_reps.email AND s.email IS NOT NULL
);

-- Update existing staff to have staff_type = 'operational' if they don't have one set
UPDATE public.staff SET staff_type = 'operational' WHERE staff_type IS NULL;
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
