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
        Schema::create('mosaic_change_logs', function (Blueprint $table) {
            $table->id();
            $table->uuid('tenant_id');
            $table->uuid('user_id');
            $table->string('change_type');
            $table->text('description');
            $table->timestamp('requested_at');
            $table->timestamp('applied_at')->nullable();
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('portal_tenants')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();

            $table->index(['tenant_id', 'requested_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mosaic_change_logs');
    }
};
