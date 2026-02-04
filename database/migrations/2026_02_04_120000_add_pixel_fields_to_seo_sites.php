<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('seo_sites', function (Blueprint $table) {
            $table->uuid('tracking_id')->nullable()->unique()->after('id');
            $table->string('pixel_install_method')->nullable()->after('settings');
            $table->string('pixel_install_status')->default('not_installed')->after('pixel_install_method');
            $table->timestamp('pixel_last_seen_at')->nullable()->after('pixel_install_status');
        });

        $existing = DB::table('seo_sites')
            ->whereNull('tracking_id')
            ->pluck('id');

        foreach ($existing as $id) {
            DB::table('seo_sites')->where('id', $id)->update([
                'tracking_id' => (string) Str::uuid(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('seo_sites', function (Blueprint $table) {
            $table->dropColumn([
                'tracking_id',
                'pixel_install_method',
                'pixel_install_status',
                'pixel_last_seen_at',
            ]);
        });
    }
};
