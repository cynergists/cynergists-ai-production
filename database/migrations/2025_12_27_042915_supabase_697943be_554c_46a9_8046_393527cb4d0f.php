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
-- Add new columns to prospects table for the requested fields
ALTER TABLE public.prospects 
ADD COLUMN IF NOT EXISTS services text,
ADD COLUMN IF NOT EXISTS last_meeting timestamp with time zone,
ADD COLUMN IF NOT EXISTS last_meeting_updated_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS last_meeting_updated_by text DEFAULT 'website',
ADD COLUMN IF NOT EXISTS last_outreach timestamp with time zone,
ADD COLUMN IF NOT EXISTS last_outreach_updated_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS last_outreach_updated_by text DEFAULT 'website',
ADD COLUMN IF NOT EXISTS next_outreach timestamp with time zone,
ADD COLUMN IF NOT EXISTS next_outreach_updated_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS next_outreach_updated_by text DEFAULT 'website',
ADD COLUMN IF NOT EXISTS est_closing_date date,
ADD COLUMN IF NOT EXISTS est_closing_date_updated_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS est_closing_date_updated_by text DEFAULT 'website',
ADD COLUMN IF NOT EXISTS sdr_set boolean DEFAULT false;
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
