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
-- Add first_name, last_name, and nick_name columns to prospects table
ALTER TABLE public.prospects
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS nick_name TEXT;

-- Add first_name, last_name, and nick_name columns to clients table
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS nick_name TEXT;

-- Add nick_name to profiles table for partners
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS nick_name TEXT;
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
