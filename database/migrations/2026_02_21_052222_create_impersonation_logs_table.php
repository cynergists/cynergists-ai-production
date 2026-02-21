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
        Schema::create('impersonation_logs', function (Blueprint $table) {
            $table->id();
            $table->string('admin_id'); // Admin performing impersonation
            $table->string('impersonated_user_id'); // User being impersonated
            $table->string('impersonated_user_email');
            $table->string('impersonated_user_name');
            $table->timestamp('started_at');
            $table->timestamp('ended_at')->nullable();
            $table->string('end_reason')->nullable(); // 'manual', 'logout', 'timeout', 'switched'
            $table->text('reason')->nullable(); // Optional reason for impersonation
            $table->json('actions_taken')->nullable(); // Key actions performed
            $table->timestamps();

            $table->index(['admin_id', 'started_at']);
            $table->index(['impersonated_user_id', 'started_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('impersonation_logs');
    }
};
