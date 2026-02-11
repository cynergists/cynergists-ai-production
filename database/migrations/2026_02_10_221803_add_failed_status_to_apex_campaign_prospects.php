<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        DB::statement("ALTER TABLE apex_campaign_prospects MODIFY COLUMN status ENUM('queued','connection_sent','connection_accepted','connection_rejected','message_sent','replied','meeting_scheduled','not_interested','skipped','failed') NOT NULL DEFAULT 'queued'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        DB::statement("ALTER TABLE apex_campaign_prospects MODIFY COLUMN status ENUM('queued','connection_sent','connection_accepted','connection_rejected','message_sent','replied','meeting_scheduled','not_interested','skipped') NOT NULL DEFAULT 'queued'");
    }
};
