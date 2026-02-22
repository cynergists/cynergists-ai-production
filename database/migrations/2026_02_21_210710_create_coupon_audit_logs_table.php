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
        Schema::create('coupon_audit_logs', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('coupon_id')->nullable()->constrained('coupons')->onDelete('set null');
            $table->string('event_type'); // created, updated, disabled, redeemed, expired, etc.
            $table->string('admin_id')->nullable(); // Admin who performed action
            $table->string('user_id')->nullable(); // User affected (for redemptions)
            
            $table->json('metadata')->nullable(); // Additional context
            $table->text('description')->nullable(); // Human-readable description
            
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            
            $table->timestamps();
            
            $table->index(['coupon_id', 'created_at']);
            $table->index('event_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coupon_audit_logs');
    }
};
