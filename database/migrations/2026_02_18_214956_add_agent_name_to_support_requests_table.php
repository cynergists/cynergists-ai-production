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
        Schema::table('support_requests', function (Blueprint $table) {
            $table->string('agent_name', 100)->nullable()->after('category');
            $table->index('agent_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('support_requests', function (Blueprint $table) {
            $table->dropIndex(['agent_name']);
            $table->dropColumn('agent_name');
        });
    }
};
