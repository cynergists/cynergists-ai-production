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
        Schema::create('agent_sidebar_configs', function (Blueprint $table) {
            $table->id();
            $table->string('agent_name')->unique(); // e.g., 'cynessa', 'apex'
            $table->json('quick_links')->nullable(); // Array of {icon, label, active, url}
            $table->json('activity_sections')->nullable(); // Array of {icon, label, count_key}
            $table->boolean('show_support_button')->default(true);
            $table->string('support_button_text')->default('Get Support');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agent_sidebar_configs');
    }
};
