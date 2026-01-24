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
-- Add separate media columns for card and product page
ALTER TABLE public.portal_available_agents 
ADD COLUMN IF NOT EXISTS card_media jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS product_media jsonb DEFAULT '[]'::jsonb;

-- Migrate existing media to card_media if image_url exists
UPDATE public.portal_available_agents
SET card_media = jsonb_build_array(jsonb_build_object('url', image_url, 'type', 'image'))
WHERE image_url IS NOT NULL AND image_url != '' AND (card_media IS NULL OR card_media = '[]'::jsonb);
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
