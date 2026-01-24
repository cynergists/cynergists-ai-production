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
        if (Schema::hasTable('portal_available_agents')) {
            Schema::table('portal_available_agents', function (Blueprint $table): void {
                if (! Schema::hasColumn('portal_available_agents', 'job_title')) {
                    $table->string('job_title')->nullable()->after('name');
                }

                if (! Schema::hasColumn('portal_available_agents', 'slug')) {
                    $table->string('slug')->nullable()->after('name');
                }

                if (! Schema::hasColumn('portal_available_agents', 'website_category')) {
                    $table->json('website_category')->nullable()->after('category');
                }

                if (! Schema::hasColumn('portal_available_agents', 'section_order')) {
                    $table->integer('section_order')->default(0)->after('sort_order');
                }

                if (! Schema::hasColumn('portal_available_agents', 'card_media')) {
                    $table->json('card_media')->nullable()->after('image_url');
                }

                if (! Schema::hasColumn('portal_available_agents', 'product_media')) {
                    $table->json('product_media')->nullable()->after('card_media');
                }

                if (! Schema::hasColumn('portal_available_agents', 'tiers')) {
                    $table->json('tiers')->nullable()->after('product_media');
                }
            });
        }

        if (! Schema::hasTable('agent_categories')) {
            Schema::create('agent_categories', function (Blueprint $table): void {
                $table->uuid('id')->primary();
                $table->string('name')->unique();
                $table->integer('display_order')->default(0);
                $table->timestamps();
            });
        }

        if (Schema::hasTable('agent_categories') && DB::table('agent_categories')->count() === 0) {
            $categories = [
                ['name' => 'Admin', 'display_order' => 1],
                ['name' => 'Communication', 'display_order' => 2],
                ['name' => 'Content', 'display_order' => 3],
                ['name' => 'Data and Analytics', 'display_order' => 4],
                ['name' => 'Finance', 'display_order' => 5],
                ['name' => 'General', 'display_order' => 6],
                ['name' => 'Growth', 'display_order' => 7],
                ['name' => 'Operations', 'display_order' => 8],
                ['name' => 'Personal', 'display_order' => 9],
                ['name' => 'Sales', 'display_order' => 10],
                ['name' => 'Software', 'display_order' => 11],
                ['name' => 'Support', 'display_order' => 12],
                ['name' => 'Tech', 'display_order' => 13],
            ];

            $now = now();
            DB::table('agent_categories')->insert(
                collect($categories)->map(fn (array $category): array => [
                    'id' => (string) Str::uuid(),
                    'name' => $category['name'],
                    'display_order' => $category['display_order'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ])->all()
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('portal_available_agents')) {
            Schema::table('portal_available_agents', function (Blueprint $table): void {
                $columns = [
                    'job_title',
                    'slug',
                    'website_category',
                    'section_order',
                    'card_media',
                    'product_media',
                    'tiers',
                ];

                foreach ($columns as $column) {
                    if (Schema::hasColumn('portal_available_agents', $column)) {
                        $table->dropColumn($column);
                    }
                }
            });
        }

        Schema::dropIfExists('agent_categories');
    }
};
