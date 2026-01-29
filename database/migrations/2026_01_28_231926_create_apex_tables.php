<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // User settings for Apex (extends user data without modifying users table)
        Schema::create('apex_user_settings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('unipile_account_id')->nullable();
            $table->boolean('autopilot_enabled')->default(false);
            $table->boolean('auto_reply_enabled')->default(false);
            $table->string('meeting_link')->nullable();
            $table->text('apex_context')->nullable();
            $table->timestamp('apex_context_updated_at')->nullable();
            $table->boolean('onboarding_completed')->default(false);
            $table->timestamps();

            $table->unique('user_id');
            $table->index('unipile_account_id');
        });

        // LinkedIn accounts connected via Unipile
        Schema::create('apex_linkedin_accounts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('unipile_account_id')->unique();
            $table->string('linkedin_profile_id')->nullable();
            $table->string('linkedin_profile_url')->nullable();
            $table->string('display_name')->nullable();
            $table->string('email')->nullable();
            $table->string('avatar_url')->nullable();
            $table->enum('status', ['active', 'pending', 'disconnected', 'error'])->default('pending');
            $table->string('checkpoint_type')->nullable(); // If LinkedIn requires verification
            $table->json('metadata')->nullable();
            $table->timestamp('last_synced_at')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('status');
        });

        // Outreach campaigns
        Schema::create('apex_campaigns', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->enum('campaign_type', ['connection', 'message', 'follow_up'])->default('connection');
            $table->enum('status', ['draft', 'active', 'paused', 'completed', 'archived'])->default('draft');
            $table->json('job_titles')->nullable(); // Target job titles
            $table->json('locations')->nullable(); // Target locations
            $table->json('keywords')->nullable(); // Search keywords
            $table->json('industries')->nullable(); // Target industries
            $table->text('connection_message')->nullable(); // Message to send with connection request
            $table->text('follow_up_message_1')->nullable();
            $table->text('follow_up_message_2')->nullable();
            $table->text('follow_up_message_3')->nullable();
            $table->integer('follow_up_delay_days_1')->default(3);
            $table->integer('follow_up_delay_days_2')->default(7);
            $table->integer('follow_up_delay_days_3')->default(14);
            $table->enum('booking_method', ['calendar', 'phone', 'manual'])->default('manual');
            $table->string('calendar_link')->nullable();
            $table->string('phone_number')->nullable();
            $table->integer('daily_connection_limit')->default(25);
            $table->integer('daily_message_limit')->default(50);
            $table->integer('connections_sent')->default(0);
            $table->integer('connections_accepted')->default(0);
            $table->integer('messages_sent')->default(0);
            $table->integer('replies_received')->default(0);
            $table->integer('meetings_booked')->default(0);
            $table->timestamp('started_at')->nullable();
            $table->timestamp('paused_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('status');
            $table->index('campaign_type');
        });

        // Prospects (leads)
        Schema::create('apex_prospects', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('linkedin_profile_id')->nullable();
            $table->string('linkedin_profile_url')->nullable();
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('full_name')->nullable();
            $table->string('headline')->nullable();
            $table->string('company')->nullable();
            $table->string('job_title')->nullable();
            $table->string('location')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('avatar_url')->nullable();
            $table->enum('connection_status', ['none', 'pending', 'connected', 'rejected'])->default('none');
            $table->json('metadata')->nullable(); // Additional data from LinkedIn/Apify
            $table->string('source')->nullable(); // e.g., 'apify', 'manual', 'linkedin_search'
            $table->timestamps();

            $table->index('user_id');
            $table->index('linkedin_profile_id');
            $table->index('connection_status');
            $table->unique(['user_id', 'linkedin_profile_id']);
        });

        // Campaign-Prospect junction table
        Schema::create('apex_campaign_prospects', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('campaign_id');
            $table->uuid('prospect_id');
            $table->enum('status', [
                'queued',
                'connection_sent',
                'connection_accepted',
                'connection_rejected',
                'message_sent',
                'replied',
                'meeting_scheduled',
                'not_interested',
                'skipped',
            ])->default('queued');
            $table->timestamp('connection_sent_at')->nullable();
            $table->timestamp('connection_accepted_at')->nullable();
            $table->timestamp('last_message_sent_at')->nullable();
            $table->timestamp('last_reply_at')->nullable();
            $table->integer('follow_up_count')->default(0);
            $table->timestamp('next_follow_up_at')->nullable();
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->foreign('campaign_id')
                ->references('id')
                ->on('apex_campaigns')
                ->onDelete('cascade');

            $table->foreign('prospect_id')
                ->references('id')
                ->on('apex_prospects')
                ->onDelete('cascade');

            $table->unique(['campaign_id', 'prospect_id']);
            $table->index('status');
            $table->index('next_follow_up_at');
        });

        // Pending actions requiring user approval
        Schema::create('apex_pending_actions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->uuid('campaign_id')->nullable();
            $table->uuid('prospect_id')->nullable();
            $table->enum('action_type', [
                'send_connection',
                'send_message',
                'send_follow_up',
                'accept_connection',
                'decline_connection',
            ]);
            $table->enum('status', ['pending', 'approved', 'denied', 'expired', 'executed'])->default('pending');
            $table->text('message_content')->nullable(); // The message to be sent
            $table->json('metadata')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('executed_at')->nullable();
            $table->timestamps();

            $table->foreign('campaign_id')
                ->references('id')
                ->on('apex_campaigns')
                ->onDelete('cascade');

            $table->foreign('prospect_id')
                ->references('id')
                ->on('apex_prospects')
                ->onDelete('cascade');

            $table->index('user_id');
            $table->index('status');
            $table->index('action_type');
            $table->index('expires_at');
        });

        // Activity log for auditing
        Schema::create('apex_activity_log', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->uuid('campaign_id')->nullable();
            $table->uuid('prospect_id')->nullable();
            $table->string('activity_type'); // e.g., 'connection_sent', 'message_sent', 'reply_received'
            $table->text('description')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->foreign('campaign_id')
                ->references('id')
                ->on('apex_campaigns')
                ->onDelete('set null');

            $table->foreign('prospect_id')
                ->references('id')
                ->on('apex_prospects')
                ->onDelete('set null');

            $table->index('user_id');
            $table->index('activity_type');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('apex_activity_log');
        Schema::dropIfExists('apex_pending_actions');
        Schema::dropIfExists('apex_campaign_prospects');
        Schema::dropIfExists('apex_prospects');
        Schema::dropIfExists('apex_campaigns');
        Schema::dropIfExists('apex_linkedin_accounts');
        Schema::dropIfExists('apex_user_settings');
    }
};
