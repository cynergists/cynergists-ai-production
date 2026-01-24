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
-- Add archive-related columns to agreements table
ALTER TABLE public.agreements 
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS archived_reason TEXT,
ADD COLUMN IF NOT EXISTS superseded_by UUID REFERENCES public.agreements(id),
ADD COLUMN IF NOT EXISTS agreement_type TEXT DEFAULT 'msa',
ADD COLUMN IF NOT EXISTS version TEXT DEFAULT '1.0',
ADD COLUMN IF NOT EXISTS effective_date DATE,
ADD COLUMN IF NOT EXISTS signer_names TEXT[];

-- Add index for faster archive queries
CREATE INDEX IF NOT EXISTS idx_agreements_archived_at ON public.agreements(archived_at) WHERE archived_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_agreements_lifecycle_status ON public.agreements(lifecycle_status);

-- Update lifecycle_status to include archive-related values
COMMENT ON COLUMN public.agreements.lifecycle_status IS 'draft, active, superseded, expired, terminated';
COMMENT ON COLUMN public.agreements.archived_at IS 'Timestamp when agreement was moved to archive';
COMMENT ON COLUMN public.agreements.archived_reason IS 'Reason for archiving: Superseded by new agreement, Terminated, Expired, etc.';
COMMENT ON COLUMN public.agreements.superseded_by IS 'Reference to the newer agreement that replaced this one';
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
