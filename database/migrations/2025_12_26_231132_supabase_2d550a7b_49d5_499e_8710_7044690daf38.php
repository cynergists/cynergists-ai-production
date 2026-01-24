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
-- Add url column to plans table
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS url text;

-- Add url column to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS url text;
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
