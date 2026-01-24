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
-- Add tiers column to portal_available_agents for tiered pricing
-- Each tier has: key (tier name), price, description
ALTER TABLE public.portal_available_agents
ADD COLUMN tiers JSONB DEFAULT '[]'::jsonb;

-- Add comment explaining the structure
COMMENT ON COLUMN public.portal_available_agents.tiers IS 'Array of tier objects: [{key: string, price: number, description: string}]';
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
