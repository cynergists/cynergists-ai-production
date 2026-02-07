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
        Schema::table('luna_generated_images', function (Blueprint $table) {
            $table->string('storage_path')->nullable()->change();
            $table->string('error_message')->nullable()->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('luna_generated_images', function (Blueprint $table) {
            $table->string('storage_path')->nullable(false)->change();
            $table->dropColumn('error_message');
        });
    }
};
