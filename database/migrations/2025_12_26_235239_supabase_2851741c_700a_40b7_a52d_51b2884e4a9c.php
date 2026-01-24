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
-- Add slug column to products table
ALTER TABLE public.products 
ADD COLUMN slug text;

-- Create unique index on slug (allowing nulls)
CREATE UNIQUE INDEX products_slug_unique ON public.products (slug) WHERE slug IS NOT NULL;
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
