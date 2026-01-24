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
-- Add website_category column to portal_available_agents
ALTER TABLE public.portal_available_agents 
ADD COLUMN website_category text DEFAULT 'New';

-- Add comment explaining the field
COMMENT ON COLUMN public.portal_available_agents.website_category IS 'Website display category: New, Popular, Software, Planned, Roadmap, Beta, Vote';
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
