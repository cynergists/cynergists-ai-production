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
-- Add credit card processing fee rate to payment_settings
ALTER TABLE public.payment_settings 
ADD COLUMN credit_card_fee_rate numeric NOT NULL DEFAULT 0.033;

-- Update the existing row to have the default value
UPDATE public.payment_settings SET credit_card_fee_rate = 0.033 WHERE credit_card_fee_rate IS NULL;
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
