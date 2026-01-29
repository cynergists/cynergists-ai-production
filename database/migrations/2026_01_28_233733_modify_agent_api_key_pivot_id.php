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
        // Drop the existing pivot table and recreate with auto-incrementing ID
        Schema::dropIfExists('agent_api_key_pivot');

        Schema::create('agent_api_key_pivot', function (Blueprint $table) {
            $table->id(); // Auto-incrementing ID
            $table->char('agent_id', 36); // FK to portal_available_agents.id
            $table->uuid('api_key_id'); // FK to agent_api_keys.id
            $table->integer('priority')->default(0);
            $table->timestamps();

            $table->foreign('agent_id')
                ->references('id')
                ->on('portal_available_agents')
                ->onDelete('cascade');

            $table->foreign('api_key_id')
                ->references('id')
                ->on('agent_api_keys')
                ->onDelete('cascade');

            $table->unique(['agent_id', 'api_key_id']);
            $table->index('priority');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agent_api_key_pivot');

        Schema::create('agent_api_key_pivot', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->char('agent_id', 36);
            $table->uuid('api_key_id');
            $table->integer('priority')->default(0);
            $table->timestamps();

            $table->foreign('agent_id')
                ->references('id')
                ->on('portal_available_agents')
                ->onDelete('cascade');

            $table->foreign('api_key_id')
                ->references('id')
                ->on('agent_api_keys')
                ->onDelete('cascade');

            $table->unique(['agent_id', 'api_key_id']);
            $table->index('priority');
        });
    }
};
