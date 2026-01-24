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
-- Add default_view_name column to all view preferences tables
ALTER TABLE public.client_view_preferences 
ADD COLUMN IF NOT EXISTS default_view_name text DEFAULT NULL;

ALTER TABLE public.partner_view_preferences 
ADD COLUMN IF NOT EXISTS default_view_name text DEFAULT NULL;

ALTER TABLE public.prospect_view_preferences 
ADD COLUMN IF NOT EXISTS default_view_name text DEFAULT NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.client_view_preferences.default_view_name IS 'Name of the saved view to load by default when opening the page';
COMMENT ON COLUMN public.partner_view_preferences.default_view_name IS 'Name of the saved view to load by default when opening the page';
COMMENT ON COLUMN public.prospect_view_preferences.default_view_name IS 'Name of the saved view to load by default when opening the page';
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
