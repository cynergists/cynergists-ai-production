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

-- 1. Create version status enum if not exists
DO $$ BEGIN
  CREATE TYPE template_version_status AS ENUM ('draft', 'published', 'archived', 'superseded');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. Enhance msa_template_versions table with new columns
ALTER TABLE msa_template_versions
  ADD COLUMN IF NOT EXISTS effective_date DATE,
  ADD COLUMN IF NOT EXISTS change_summary TEXT,
  ADD COLUMN IF NOT EXISTS supersedes_version_id UUID REFERENCES msa_template_versions(id),
  ADD COLUMN IF NOT EXISTS notification_sent BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS notification_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS execution_count INTEGER DEFAULT 0;

-- 3. Create unique partial index: only one published per template
DROP INDEX IF EXISTS unique_published_version;
CREATE UNIQUE INDEX unique_published_version 
  ON msa_template_versions (template_id) 
  WHERE status = 'published';

-- 4. Create immutability trigger function (prevent editing published/archived versions)
CREATE OR REPLACE FUNCTION prevent_version_content_mutation() 
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IN ('published', 'archived', 'superseded') 
     AND (NEW.content IS DISTINCT FROM OLD.content OR NEW.title IS DISTINCT FROM OLD.title) THEN
    RAISE EXCEPTION 'Cannot modify content of % version', OLD.status;
  END IF;
  RETURN NEW;
END;
$$;

-- 5. Create the immutability trigger
DROP TRIGGER IF EXISTS enforce_version_immutability ON msa_template_versions;
CREATE TRIGGER enforce_version_immutability
  BEFORE UPDATE ON msa_template_versions
  FOR EACH ROW EXECUTE FUNCTION prevent_version_content_mutation();

-- 6. Create deletion prevention trigger function
CREATE OR REPLACE FUNCTION prevent_version_deletion() 
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RAISE EXCEPTION 'Version records cannot be deleted for legal compliance';
END;
$$;

-- 7. Create deletion prevention trigger
DROP TRIGGER IF EXISTS prevent_version_delete ON msa_template_versions;
CREATE TRIGGER prevent_version_delete
  BEFORE DELETE ON msa_template_versions
  FOR EACH ROW EXECUTE FUNCTION prevent_version_deletion();

-- 8. Prevent msa_version_id modification on signed agreements
CREATE OR REPLACE FUNCTION prevent_signed_agreement_version_change() 
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status = 'signed' 
     AND OLD.msa_version_id IS NOT NULL 
     AND NEW.msa_version_id IS DISTINCT FROM OLD.msa_version_id THEN
    RAISE EXCEPTION 'Cannot change version reference on signed agreement';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_signed_agreement_version ON agreements;
CREATE TRIGGER protect_signed_agreement_version
  BEFORE UPDATE ON agreements
  FOR EACH ROW EXECUTE FUNCTION prevent_signed_agreement_version_change();

-- 9. Function to increment execution count when agreement is signed
CREATE OR REPLACE FUNCTION increment_version_execution_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'signed' AND OLD.status != 'signed' AND NEW.msa_version_id IS NOT NULL THEN
    UPDATE msa_template_versions
    SET execution_count = execution_count + 1
    WHERE id = NEW.msa_version_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS track_version_executions ON agreements;
CREATE TRIGGER track_version_executions
  AFTER UPDATE ON agreements
  FOR EACH ROW EXECUTE FUNCTION increment_version_execution_count();
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
