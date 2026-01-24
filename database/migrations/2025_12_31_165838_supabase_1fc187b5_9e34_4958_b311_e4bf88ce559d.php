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
-- Rename subheadline column to paragraph in calendars table
ALTER TABLE public.calendars RENAME COLUMN subheadline TO paragraph;

-- Rename subheadline column to paragraph in calendar_templates table
ALTER TABLE public.calendar_templates RENAME COLUMN subheadline TO paragraph;

-- Update any existing calendars with the new default paragraph text
UPDATE public.calendars 
SET paragraph = 'Growth should not depend on heroics. Cynergists helps your team move faster, stay aligned, and get more done without the constant friction. No pitch. Just a quick chat to see if you are a fit.'
WHERE paragraph IS NULL OR paragraph = 'We handle the chaos behind the scenes—so you can lead, grow, and build your legacy on your terms.';
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
