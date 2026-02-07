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
        Schema::create('luna_generated_images', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('tenant_id');
            $table->string('user_id');
            $table->string('agent_access_id')->nullable();
            $table->string('conversation_id')->nullable();
            $table->text('prompt');
            $table->string('storage_path');
            $table->string('public_url')->nullable();
            $table->string('aspect_ratio')->default('landscape');
            $table->string('quality')->default('high');
            $table->string('status')->default('completed');
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index('tenant_id');
            $table->index('user_id');
            $table->index('conversation_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('luna_generated_images');
    }
};
