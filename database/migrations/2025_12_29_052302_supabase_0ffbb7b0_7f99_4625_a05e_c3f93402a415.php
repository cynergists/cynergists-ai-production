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
-- Update default column order to move tags to the end
ALTER TABLE prospect_view_preferences 
ALTER COLUMN column_order SET DEFAULT ARRAY['name', 'email', 'phone', 'status', 'interested_plan', 'estimated_value', 'lead_source', 'last_activity', 'last_contact', 'next_meeting', 'sales_rep', 'partner_name', 'tags']::text[];
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
