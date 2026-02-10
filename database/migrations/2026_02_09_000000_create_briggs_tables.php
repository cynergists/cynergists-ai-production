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
        // User settings for Briggs (extends user data without modifying users table)
        Schema::create('briggs_user_settings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('skill_level', ['beginner', 'intermediate', 'advanced'])->default('beginner');
            $table->string('preferred_industry')->nullable();
            $table->text('briggs_context')->nullable();
            $table->timestamp('briggs_context_updated_at')->nullable();
            $table->boolean('onboarding_completed')->default(false);
            $table->integer('total_sessions_completed')->default(0);
            $table->decimal('average_score', 5, 2)->nullable();
            $table->timestamps();

            $table->unique('user_id');
        });

        // Predefined training scenarios library
        Schema::create('briggs_training_scenarios', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->enum('category', [
                'objection_handling',
                'cold_call',
                'discovery_call',
                'pitch',
                'closing',
                'follow_up',
                'negotiation',
            ]);
            $table->enum('difficulty', ['beginner', 'intermediate', 'advanced']);
            $table->string('industry')->nullable();
            $table->text('buyer_persona');
            $table->string('buyer_name');
            $table->string('buyer_title');
            $table->string('buyer_company');
            $table->text('scenario_context');
            $table->json('objectives');
            $table->json('scoring_criteria');
            $table->json('common_objections')->nullable();
            $table->json('ideal_responses')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index('category');
            $table->index('difficulty');
            $table->index('is_active');
        });

        // Training sessions (completed or in-progress training runs)
        Schema::create('briggs_training_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->uuid('scenario_id')->nullable();
            $table->string('title');
            $table->string('category')->nullable();
            $table->string('difficulty')->nullable();
            $table->enum('status', ['in_progress', 'completed', 'abandoned'])->default('in_progress');
            $table->json('conversation_log')->nullable();
            $table->decimal('score', 5, 2)->nullable();
            $table->json('score_breakdown')->nullable();
            $table->json('strengths')->nullable();
            $table->json('improvements')->nullable();
            $table->text('ai_feedback')->nullable();
            $table->integer('duration_seconds')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->foreign('scenario_id')
                ->references('id')
                ->on('briggs_training_scenarios')
                ->onDelete('set null');

            $table->index('user_id');
            $table->index('status');
            $table->index('score');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('briggs_training_sessions');
        Schema::dropIfExists('briggs_training_scenarios');
        Schema::dropIfExists('briggs_user_settings');
    }
};
