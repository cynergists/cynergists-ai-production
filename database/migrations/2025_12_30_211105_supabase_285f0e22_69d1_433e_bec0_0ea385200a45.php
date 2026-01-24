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
-- Add missing values to payout_status enum
ALTER TYPE payout_status ADD VALUE IF NOT EXISTS 'scheduled';
ALTER TYPE payout_status ADD VALUE IF NOT EXISTS 'ready';
ALTER TYPE payout_status ADD VALUE IF NOT EXISTS 'paid';
ALTER TYPE payout_status ADD VALUE IF NOT EXISTS 'canceled';
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
