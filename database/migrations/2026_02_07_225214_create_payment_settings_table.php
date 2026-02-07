<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payment_settings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('payment_mode')->default('sandbox');
            $table->decimal('credit_card_fee_rate', 5, 4)->default(0.0330);
            $table->timestamps();
        });

        DB::table('payment_settings')->insert([
            'id' => \Illuminate\Support\Str::uuid(),
            'payment_mode' => 'production',
            'credit_card_fee_rate' => 0.033,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_settings');
    }
};
