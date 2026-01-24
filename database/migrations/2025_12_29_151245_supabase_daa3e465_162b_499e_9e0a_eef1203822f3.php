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
-- Drop the old constraint and add a new one that includes 'superseded'
ALTER TABLE msa_template_versions 
DROP CONSTRAINT msa_template_versions_status_check;

ALTER TABLE msa_template_versions 
ADD CONSTRAINT msa_template_versions_status_check 
CHECK (status = ANY (ARRAY['draft'::text, 'published'::text, 'archived'::text, 'superseded'::text]));

-- Also add the trigger to prevent version deletion for legal compliance
CREATE TRIGGER prevent_msa_version_deletion
  BEFORE DELETE ON msa_template_versions
  FOR EACH ROW
  EXECUTE FUNCTION prevent_version_deletion();
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
