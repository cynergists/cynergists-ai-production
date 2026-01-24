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
-- Drop the permissive SELECT policy that exposes all data
DROP POLICY IF EXISTS "Allow reading by session_id" ON public.audit_completions;

-- Add service-role-only SELECT policy for audit_completions
CREATE POLICY "Service role only - audit_completions_select"
ON public.audit_completions
FOR SELECT
USING (auth.role() = 'service_role');
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
