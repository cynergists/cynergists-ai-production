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
        Schema::create('coupon_redemptions', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('coupon_id')->constrained('coupons')->onDelete('cascade');
            $table->string('user_id'); // User who redeemed
            $table->string('agent_id')->nullable(); // Which agent it was applied to
            $table->string('subscription_id')->nullable(); // Square subscription ID
            
            // Redemption Details
            $table->timestamp('redeemed_at');
            $table->decimal('discount_amount', 10, 2)->nullable(); // Calculated discount value
            $table->integer('trial_days')->nullable(); // If free trial
            $table->timestamp('trial_ends_at')->nullable();
            
            // Status Tracking
            $table->enum('status', ['active', 'expired', 'cancelled', 'converted'])->default('active');
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->text('cancellation_reason')->nullable();
            
            // Billing Outcome
            $table->boolean('converted_to_paid')->default(false);
            $table->timestamp('converted_at')->nullable();
            $table->decimal('first_paid_amount', 10, 2)->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index(['coupon_id', 'user_id']);
            $table->index(['user_id', 'agent_id']);
            $table->index('status');
            $table->unique(['coupon_id', 'user_id', 'agent_id']); // Prevent duplicate redemptions
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coupon_redemptions');
    }
};
