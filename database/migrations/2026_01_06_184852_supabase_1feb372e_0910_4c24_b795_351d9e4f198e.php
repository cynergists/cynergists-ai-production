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
-- Add section_order column for ordering agents within each website_category section
ALTER TABLE portal_available_agents 
ADD COLUMN IF NOT EXISTS section_order integer DEFAULT 999;

-- Create index for efficient section ordering queries
CREATE INDEX IF NOT EXISTS idx_portal_agents_section_order 
ON portal_available_agents(website_category, section_order);
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
