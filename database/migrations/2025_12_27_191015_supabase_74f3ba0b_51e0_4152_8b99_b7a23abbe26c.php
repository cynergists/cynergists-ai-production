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
-- Add hourly_rate and part_time_price columns to products table for specialist pricing
ALTER TABLE public.products 
ADD COLUMN hourly_rate numeric NULL,
ADD COLUMN part_time_price numeric NULL;
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
