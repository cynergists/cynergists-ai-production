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
        Schema::table('portal_available_agents', function (Blueprint $table) {
            $table->boolean('is_beta')->default(false)->after('is_popular');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('portal_available_agents', function (Blueprint $table) {
            $table->dropColumn('is_beta');
        });
    }
};
