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
-- Add headline and subheadline columns to calendars table
ALTER TABLE public.calendars 
ADD COLUMN headline text DEFAULT 'Lead Like a Hero, Leave the Heavy Lifting to Us',
ADD COLUMN subheadline text DEFAULT 'We handle the chaos behind the scenes—so you can lead, grow, and build your legacy on your terms.';
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
