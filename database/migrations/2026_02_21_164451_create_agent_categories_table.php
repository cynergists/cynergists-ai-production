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
        Schema::create('agent_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // e.g., "Lead Generation"
            $table->string('slug')->unique(); // e.g., "lead-generation"
            $table->text('description')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_archived')->default(false); // Can archive, not delete
            $table->timestamps();

            $table->index('slug');
            $table->index(['is_active', 'is_archived']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agent_categories');
    }
};
