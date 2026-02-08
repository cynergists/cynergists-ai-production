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
        Schema::table('portal_tenants', function (Blueprint $table) {
            $table->string('square_customer_id')->nullable()->after('status');
            $table->index('square_customer_id');
        });

        Schema::table('customer_subscriptions', function (Blueprint $table) {
            $table->string('square_subscription_id')->nullable()->after('payment_id');
            $table->string('square_card_id')->nullable()->after('square_subscription_id');
            $table->string('billing_type', 20)->default('one_time')->after('auto_renew');
            $table->index('square_subscription_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customer_subscriptions', function (Blueprint $table) {
            $table->dropIndex(['square_subscription_id']);
            $table->dropColumn(['square_subscription_id', 'square_card_id', 'billing_type']);
        });

        Schema::table('portal_tenants', function (Blueprint $table) {
            $table->dropIndex(['square_customer_id']);
            $table->dropColumn('square_customer_id');
        });
    }
};
