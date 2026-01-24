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
-- Allow public read access to active document templates (MSA, Terms, Privacy)
CREATE POLICY "Anyone can view active document templates"
ON public.document_templates
FOR SELECT
USING (is_active = true);
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
