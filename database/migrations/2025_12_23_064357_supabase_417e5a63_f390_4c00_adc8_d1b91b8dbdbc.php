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
-- Add signing_fields JSON column to document_templates to store placed field configurations
ALTER TABLE public.document_templates 
ADD COLUMN IF NOT EXISTS signing_fields jsonb DEFAULT '[]'::jsonb;
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
