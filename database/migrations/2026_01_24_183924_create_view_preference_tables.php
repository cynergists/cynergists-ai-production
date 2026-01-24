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
        $tables = [
            'client_view_preferences',
            'prospect_view_preferences',
            'partner_view_preferences',
            'staff_view_preferences',
            'sales_rep_view_preferences',
            'calendar_view_preferences',
        ];

        foreach ($tables as $tableName) {
            if (Schema::hasTable($tableName)) {
                continue;
            }

            Schema::create($tableName, function (Blueprint $table): void {
                $table->uuid('id')->primary();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->json('column_order')->nullable();
                $table->json('hidden_columns')->nullable();
                $table->json('column_widths')->nullable();
                $table->string('sort_column')->nullable();
                $table->string('sort_direction')->nullable();
                $table->json('active_filters')->nullable();
                $table->unsignedInteger('rows_per_page')->default(50);
                $table->json('saved_views')->nullable();
                $table->string('active_view_name')->nullable();
                $table->string('default_view_name')->nullable();
                $table->timestamps();
                $table->unique('user_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('calendar_view_preferences');
        Schema::dropIfExists('sales_rep_view_preferences');
        Schema::dropIfExists('staff_view_preferences');
        Schema::dropIfExists('partner_view_preferences');
        Schema::dropIfExists('prospect_view_preferences');
        Schema::dropIfExists('client_view_preferences');
    }
};
