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
-- Add slug column to portal_available_agents
ALTER TABLE public.portal_available_agents 
ADD COLUMN slug TEXT UNIQUE;

-- Populate slugs from existing names (lowercase, replace spaces with hyphens)
UPDATE public.portal_available_agents 
SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'));

-- Make slug NOT NULL after populating
ALTER TABLE public.portal_available_agents 
ALTER COLUMN slug SET NOT NULL;

-- Create index for fast slug lookups
CREATE INDEX idx_portal_available_agents_slug ON public.portal_available_agents(slug);
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
