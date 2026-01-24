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
-- Create a partners view that joins profiles with user_roles
-- This makes it easier to query partners with their profile data

-- First, let's add some useful fields to profiles if they don't exist
-- (checking existing schema, the profiles table already has the fields we need)

-- Create a function to get all partners (users with partner role)
CREATE OR REPLACE FUNCTION public.get_partners()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  email text,
  first_name text,
  last_name text,
  company_name text,
  phone text,
  title text,
  status user_status,
  partnership_interest text,
  referral_volume text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.user_id,
    p.email,
    p.first_name,
    p.last_name,
    p.company_name,
    p.phone,
    p.title,
    p.status,
    p.partnership_interest,
    p.referral_volume,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  INNER JOIN public.user_roles ur ON ur.user_id = p.user_id
  WHERE ur.role = 'partner'
  ORDER BY p.created_at DESC;
$$;
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
