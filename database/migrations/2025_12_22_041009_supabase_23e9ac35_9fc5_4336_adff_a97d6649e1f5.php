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
-- Create audit_completions table for tracking Operations Readiness Audit
CREATE TABLE public.audit_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  ip_address TEXT,
  score INTEGER NOT NULL,
  result_tier TEXT NOT NULL,
  answers JSONB NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- IP-derived geolocation data
  geo_city TEXT,
  geo_region TEXT,
  geo_country TEXT,
  
  -- Optional contact form data
  contact_name TEXT,
  contact_email TEXT,
  contact_submitted_at TIMESTAMPTZ,
  
  -- Metadata
  user_agent TEXT,
  referrer TEXT,
  page_path TEXT
);

-- Enable Row Level Security
ALTER TABLE public.audit_completions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for tracking without auth)
CREATE POLICY "Allow anonymous inserts for audit completions"
ON public.audit_completions
FOR INSERT
WITH CHECK (true);

-- Allow reading own session data
CREATE POLICY "Allow reading by session_id"
ON public.audit_completions
FOR SELECT
USING (true);

-- Create index for faster session lookups
CREATE INDEX idx_audit_completions_session_id ON public.audit_completions(session_id);
CREATE INDEX idx_audit_completions_completed_at ON public.audit_completions(completed_at DESC);
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
