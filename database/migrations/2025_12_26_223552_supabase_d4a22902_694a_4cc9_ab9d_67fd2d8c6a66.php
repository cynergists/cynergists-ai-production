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
-- Update plan_status enum to match new values
ALTER TYPE plan_status RENAME VALUE 'live' TO 'active';
ALTER TYPE plan_status ADD VALUE IF NOT EXISTS 'draft' BEFORE 'active';

-- Update product_status enum to match new values
ALTER TYPE product_status RENAME VALUE 'archived' TO 'test';
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
