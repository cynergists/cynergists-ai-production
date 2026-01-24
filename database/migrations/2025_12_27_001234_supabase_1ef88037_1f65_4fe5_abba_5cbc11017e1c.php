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
-- Add type column to plans table
ALTER TABLE public.plans 
ADD COLUMN type text DEFAULT 'plan';

-- Add type column to products table
ALTER TABLE public.products 
ADD COLUMN type text DEFAULT 'product';
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
