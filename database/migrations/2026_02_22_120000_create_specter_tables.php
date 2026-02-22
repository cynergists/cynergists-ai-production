<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('specter_visitors', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->string('visitor_id');
            $table->json('cookie_ids')->nullable();
            $table->string('consent_state')->default('unknown');
            $table->string('consent_version')->nullable();
            $table->boolean('dnt')->default(false);
            $table->timestamp('first_seen_at')->nullable();
            $table->timestamp('last_seen_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->unique(['tenant_id', 'visitor_id']);
        });

        Schema::create('specter_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->foreignUuid('specter_visitor_id')->constrained('specter_visitors')->cascadeOnDelete();
            $table->string('session_id');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->integer('intent_score')->default(0);
            $table->string('intent_tier')->default('low');
            $table->string('heat_zone')->default('low');
            $table->string('resolution_status')->default('unresolved');
            $table->decimal('resolution_confidence', 5, 2)->nullable();
            $table->string('resolution_source')->nullable();
            $table->json('scoring_feature_breakdown')->nullable();
            $table->json('metrics')->nullable();
            $table->string('last_page_url')->nullable();
            $table->text('referrer')->nullable();
            $table->json('utm_params')->nullable();
            $table->string('device_type')->nullable();
            $table->string('ip_hash')->nullable();
            $table->string('company_name')->nullable();
            $table->string('company_domain')->nullable();
            $table->timestamps();
            $table->unique(['tenant_id', 'session_id']);
            $table->index(['tenant_id', 'intent_tier']);
            $table->index(['tenant_id', 'resolution_status']);
        });

        Schema::create('specter_events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->foreignUuid('specter_session_id')->constrained('specter_sessions')->cascadeOnDelete();
            $table->string('event_id')->nullable();
            $table->string('type');
            $table->text('page_url')->nullable();
            $table->timestamp('occurred_at');
            $table->json('metadata')->nullable();
            $table->boolean('is_bot')->default(false);
            $table->timestamps();
            $table->index(['specter_session_id', 'type']);
            $table->index(['tenant_id', 'occurred_at']);
        });

        Schema::create('specter_scoring_rules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->nullable()->index();
            $table->string('signal_key');
            $table->decimal('weight', 8, 2)->default(0);
            $table->json('config')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
            $table->index(['tenant_id', 'is_active']);
        });

        Schema::create('specter_crm_sync_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->foreignUuid('specter_session_id')->nullable()->constrained('specter_sessions')->nullOnDelete();
            $table->string('crm_object_type');
            $table->string('crm_object_id')->nullable();
            $table->string('operation');
            $table->string('status');
            $table->string('error_code')->nullable();
            $table->text('error_message')->nullable();
            $table->json('payload_summary')->nullable();
            $table->timestamps();
            $table->index(['tenant_id', 'status']);
        });

        Schema::create('specter_escalation_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->foreignUuid('specter_session_id')->nullable()->constrained('specter_sessions')->nullOnDelete();
            $table->string('visitor_id')->nullable();
            $table->string('reason_code');
            $table->json('details')->nullable();
            $table->string('integration')->nullable();
            $table->string('provider')->nullable();
            $table->timestamps();
            $table->index(['tenant_id', 'reason_code']);
        });

        Schema::create('specter_trigger_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->index();
            $table->foreignUuid('specter_session_id')->nullable()->constrained('specter_sessions')->nullOnDelete();
            $table->string('workflow_slug');
            $table->json('payload');
            $table->string('status')->default('queued');
            $table->timestamps();
            $table->index(['tenant_id', 'workflow_slug']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('specter_trigger_logs');
        Schema::dropIfExists('specter_escalation_logs');
        Schema::dropIfExists('specter_crm_sync_logs');
        Schema::dropIfExists('specter_scoring_rules');
        Schema::dropIfExists('specter_events');
        Schema::dropIfExists('specter_sessions');
        Schema::dropIfExists('specter_visitors');
    }
};
