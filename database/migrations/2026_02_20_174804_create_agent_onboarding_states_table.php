<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agent_onboarding_states', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('portal_tenants')->cascadeOnDelete();
            $table->string('agent_name', 50);
            $table->enum('state', ['not_started', 'in_progress', 'completed', 'failed'])->default('not_started');
            $table->json('progress_data')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->timestamps();

            $table->unique(['tenant_id', 'agent_name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agent_onboarding_states');
    }
};
