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
-- Create RPC function to get agreement sections by token
CREATE OR REPLACE FUNCTION public.get_agreement_sections_by_token(agreement_token text)
RETURNS TABLE (
  id uuid,
  section_key text,
  section_title text,
  initials text,
  initialed_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_agreement_id uuid;
BEGIN
  -- Get the agreement ID from the token
  SELECT agreements.id INTO v_agreement_id
  FROM agreements
  WHERE agreements.token = agreement_token
  LIMIT 1;
  
  IF v_agreement_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Return the sections for this agreement
  RETURN QUERY
  SELECT 
    agreement_sections.id,
    agreement_sections.section_key,
    agreement_sections.section_title,
    agreement_sections.initials,
    agreement_sections.initialed_at
  FROM agreement_sections
  WHERE agreement_sections.agreement_id = v_agreement_id
  ORDER BY agreement_sections.created_at;
END;
$$;
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
