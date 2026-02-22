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
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            
            // Basic Info
            $table->string('name'); // Internal reference
            $table->string('code')->unique(); // Case-insensitive unique code
            $table->text('description')->nullable();
            
            // Discount Type & Value
            $table->enum('discount_type', ['free_trial', 'percentage']); // free_trial or percentage
            $table->integer('discount_value'); // Days for trial OR percentage for discount
            
            // Duration & Timing
            $table->integer('duration_days')->nullable(); // How long discount/trial lasts
            $table->timestamp('valid_from'); // Redemption window start
            $table->timestamp('valid_until'); // Redemption window end
            
            // Usage Limits
            $table->integer('max_redemptions_per_customer')->default(1); // Per-customer limit
            $table->integer('max_redemptions_global')->nullable(); // Global limit (optional)
            $table->integer('redemptions_count')->default(0); // Current redemption count
            
            // Eligibility
            $table->enum('customer_eligibility', ['new_only', 'existing_only', 'both'])->default('new_only');
            
            // Applicable Agents
            $table->json('applicable_agent_ids')->nullable(); // null = all agents, or array of IDs
            
            // Status
            $table->boolean('is_active')->default(true);
            $table->boolean('allow_stacking')->default(false); // Always false per spec
            
            // Audit
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->softDeletes(); // Soft delete only per spec
            $table->timestamps();
            
            // Indexes
            $table->index('code');
            $table->index(['valid_from', 'valid_until']);
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coupons');
    }
};
