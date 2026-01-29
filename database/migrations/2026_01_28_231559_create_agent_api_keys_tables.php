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
        // Main table for storing API keys
        Schema::create('agent_api_keys', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name'); // Human-readable name (e.g., "Unipile Production")
            $table->string('provider'); // Service provider (e.g., "unipile", "apify", "openai")
            $table->text('key'); // The actual API key (encrypted at model level)
            $table->json('metadata')->nullable(); // Additional config like domain, account_id, etc.
            $table->boolean('is_active')->default(true);
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->index('provider');
            $table->index('is_active');
        });

        // Pivot table for many-to-many relationship between agents and API keys
        Schema::create('agent_api_key_pivot', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->char('agent_id', 36); // FK to portal_available_agents.id
            $table->uuid('api_key_id'); // FK to agent_api_keys.id
            $table->integer('priority')->default(0); // If multiple keys for same provider, which to prefer
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
        Schema::dropIfExists('agent_api_keys');
    }
};
