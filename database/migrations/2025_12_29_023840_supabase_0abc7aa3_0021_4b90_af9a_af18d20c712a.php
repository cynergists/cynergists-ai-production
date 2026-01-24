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
-- Drop the existing check constraint and add an updated one that includes partner and sales_reps
ALTER TABLE public.document_templates DROP CONSTRAINT IF EXISTS document_templates_document_type_check;

ALTER TABLE public.document_templates ADD CONSTRAINT document_templates_document_type_check 
  CHECK (document_type IN ('msa', 'terms', 'privacy', 'partner', 'sales_reps'));
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
