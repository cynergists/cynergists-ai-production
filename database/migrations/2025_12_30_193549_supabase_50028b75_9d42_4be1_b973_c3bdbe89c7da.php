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
-- Add W-9 tracking and profile status fields to partners table
ALTER TABLE partners ADD COLUMN IF NOT EXISTS w9_status text NOT NULL DEFAULT 'not_submitted';
ALTER TABLE partners ADD COLUMN IF NOT EXISTS profile_complete boolean NOT NULL DEFAULT false;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS has_fraud_flag boolean NOT NULL DEFAULT false;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS payout_method_verified boolean NOT NULL DEFAULT false;

-- Add comment for w9_status values
COMMENT ON COLUMN partners.w9_status IS 'Values: not_submitted, submitted, verified, rejected';
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
