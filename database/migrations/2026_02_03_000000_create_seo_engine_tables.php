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
        Schema::create('seo_sites', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->nullable()->index();
            $table->uuid('user_id')->nullable()->index();
            $table->string('name');
            $table->string('url');
            $table->string('status')->default('active');
            $table->json('settings')->nullable();
            $table->timestamp('last_audit_at')->nullable();
            $table->timestamps();
        });

        Schema::create('seo_audits', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('seo_site_id')->index();
            $table->string('status')->default('pending');
            $table->string('trigger')->default('scheduled');
            $table->integer('issues_count')->default(0);
            $table->json('metrics')->nullable();
            $table->text('summary')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('seo_recommendations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('seo_site_id')->index();
            $table->uuid('seo_audit_id')->index();
            $table->string('type')->default('technical');
            $table->string('title');
            $table->text('description')->nullable();
            $table->json('target_pages')->nullable();
            $table->integer('impact_score')->default(0);
            $table->string('effort')->default('medium');
            $table->string('status')->default('pending');
            $table->json('metadata')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('applied_at')->nullable();
            $table->timestamps();
        });

        Schema::create('seo_recommendation_approvals', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('seo_recommendation_id')->index();
            $table->uuid('user_id')->nullable()->index();
            $table->string('decision')->default('approved');
            $table->text('notes')->nullable();
            $table->timestamp('decided_at')->nullable();
            $table->timestamps();
        });

        Schema::create('seo_changes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('seo_site_id')->index();
            $table->uuid('seo_recommendation_id')->index();
            $table->string('status')->default('applied');
            $table->text('summary')->nullable();
            $table->json('diff')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('applied_at')->nullable();
            $table->timestamps();
        });

        Schema::create('seo_reports', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('seo_site_id')->index();
            $table->date('period_start');
            $table->date('period_end');
            $table->string('status')->default('ready');
            $table->json('highlights')->nullable();
            $table->text('report_url')->nullable();
            $table->json('metrics')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('seo_reports');
        Schema::dropIfExists('seo_changes');
        Schema::dropIfExists('seo_recommendation_approvals');
        Schema::dropIfExists('seo_recommendations');
        Schema::dropIfExists('seo_audits');
        Schema::dropIfExists('seo_sites');
    }
};
