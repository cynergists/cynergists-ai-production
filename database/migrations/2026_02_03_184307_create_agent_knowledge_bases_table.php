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
        Schema::create('agent_knowledge_bases', function (Blueprint $table) {
            $table->id();
            $table->string('agent_name')->unique(); // e.g., 'cynessa', 'apex'
            $table->string('title'); // e.g., 'Cynessa Knowledge Base v1.1'
            $table->longText('content'); // The actual markdown content
            $table->boolean('is_active')->default(true);
            $table->string('version')->nullable(); // e.g., 'v1.1'
            $table->timestamp('last_updated_by_user_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agent_knowledge_bases');
    }
};
