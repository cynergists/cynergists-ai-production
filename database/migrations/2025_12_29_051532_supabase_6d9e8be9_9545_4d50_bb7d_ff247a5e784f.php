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
-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Service role only - staff" ON public.staff;

-- Create policies for admin users to manage staff
CREATE POLICY "Admins can view all staff" 
ON public.staff 
FOR SELECT 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert staff" 
ON public.staff 
FOR INSERT 
TO authenticated 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update staff" 
ON public.staff 
FOR UPDATE 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete staff" 
ON public.staff 
FOR DELETE 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
