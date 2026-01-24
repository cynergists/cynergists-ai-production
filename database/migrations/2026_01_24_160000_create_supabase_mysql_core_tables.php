<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! in_array(DB::getDriverName(), ['mysql', 'sqlite'], true)) {
            return;
        }

        if (! Schema::hasTable('staff')) {
            Schema::create('staff', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('name');
                $table->string('title')->nullable();
                $table->string('status')->default('active');
                $table->date('start_date')->nullable();
                $table->date('end_date')->nullable();
                $table->decimal('hourly_pay', 10, 2)->nullable();
                $table->decimal('hours_per_week', 5, 2)->nullable();
                $table->decimal('monthly_pay', 10, 2)->nullable();
                $table->string('email')->nullable();
                $table->string('phone')->nullable();
                $table->string('city')->nullable();
                $table->string('country')->nullable();
                $table->string('account_type')->nullable();
                $table->string('bank_name')->nullable();
                $table->string('account_number')->nullable();
                $table->string('routing_number')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('staff_hours')) {
            Schema::create('staff_hours', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('staff_id');
                $table->date('period_start');
                $table->date('period_end');
                $table->decimal('hours_worked', 6, 2)->default(0);
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('portal_available_agents')) {
            Schema::create('portal_available_agents', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('name');
                $table->text('description')->nullable();
                $table->decimal('price', 12, 2)->default(0);
                $table->string('category')->default('general');
                $table->string('icon')->nullable()->default('bot');
                $table->json('features')->nullable();
                $table->boolean('is_popular')->default(false);
                $table->boolean('is_active')->default(true);
                $table->integer('sort_order')->default(0);
                $table->json('perfect_for')->nullable();
                $table->json('integrations')->nullable();
                $table->text('image_url')->nullable();
                $table->text('long_description')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('portal_roadmap_items')) {
            Schema::create('portal_roadmap_items', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('title');
                $table->text('description')->nullable();
                $table->string('status')->default('planned');
                $table->string('eta')->nullable();
                $table->string('category')->nullable();
                $table->integer('progress')->default(0);
                $table->integer('sort_order')->default(0);
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('portal_integrations')) {
            Schema::create('portal_integrations', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('name');
                $table->text('description')->nullable();
                $table->string('icon')->nullable()->default('plug');
                $table->string('category')->nullable()->default('general');
                $table->boolean('is_active')->default(true);
                $table->integer('sort_order')->default(0);
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('portal_faq_items')) {
            Schema::create('portal_faq_items', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->text('question');
                $table->text('answer');
                $table->integer('sort_order')->default(0);
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('agent_suggestions')) {
            Schema::create('agent_suggestions', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('user_id');
                $table->uuid('customer_id')->nullable();
                $table->string('agent_name');
                $table->string('category');
                $table->text('description');
                $table->text('use_case')->nullable();
                $table->string('status')->default('pending');
                $table->text('admin_notes')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('portal_tenants')) {
            Schema::create('portal_tenants', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('user_id');
                $table->string('company_name');
                $table->string('subdomain')->unique();
                $table->boolean('is_temp_subdomain')->default(true);
                $table->text('logo_url')->nullable();
                $table->string('primary_color')->default('#22c55e');
                $table->json('settings')->nullable();
                $table->string('status')->default('active');
                $table->timestamp('onboarding_completed_at')->nullable();
                $table->timestamps();
                $table->index('user_id');
            });
        }

        if (! Schema::hasTable('customer_subscriptions')) {
            Schema::create('customer_subscriptions', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('customer_id');
                $table->uuid('product_id');
                $table->uuid('payment_id')->nullable();
                $table->string('status')->default('active');
                $table->string('tier')->default('basic');
                $table->timestamp('start_date')->useCurrent();
                $table->timestamp('end_date')->nullable();
                $table->boolean('auto_renew')->default(true);
                $table->uuid('tenant_id')->nullable();
                $table->timestamps();
                $table->index('customer_id');
                $table->index('product_id');
                $table->index('status');
            });
        }

        if (! Schema::hasTable('agent_access')) {
            Schema::create('agent_access', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('subscription_id');
                $table->uuid('customer_id');
                $table->string('agent_type');
                $table->string('agent_name');
                $table->json('configuration')->nullable();
                $table->boolean('is_active')->default(true);
                $table->integer('usage_count')->default(0);
                $table->integer('usage_limit')->nullable();
                $table->timestamp('last_used_at')->nullable();
                $table->uuid('tenant_id')->nullable();
                $table->timestamps();
                $table->index('subscription_id');
                $table->index('customer_id');
                $table->index('agent_type');
            });
        }

        if (! Schema::hasTable('agent_conversations')) {
            Schema::create('agent_conversations', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('agent_access_id');
                $table->uuid('customer_id');
                $table->string('title')->nullable();
                $table->json('messages')->nullable();
                $table->string('status')->default('active');
                $table->uuid('tenant_id')->nullable();
                $table->timestamps();
                $table->index('agent_access_id');
                $table->index('customer_id');
            });
        }

        if (! Schema::hasTable('agent_memory')) {
            Schema::create('agent_memory', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('customer_id');
                $table->string('memory_key');
                $table->json('memory_value');
                $table->string('agent_source')->nullable();
                $table->timestamp('expires_at')->nullable();
                $table->timestamps();
                $table->unique(['customer_id', 'memory_key']);
                $table->index('customer_id');
            });
        }

        if (! Schema::hasTable('partners')) {
            Schema::create('partners', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('first_name');
                $table->string('last_name');
                $table->string('email');
                $table->string('phone')->nullable();
                $table->string('company_name')->nullable();
                $table->string('partner_type')->default('sole_proprietor');
                $table->string('partner_status')->default('active');
                $table->boolean('agreement_sent')->default(false);
                $table->date('agreement_sent_date')->nullable();
                $table->boolean('agreement_signed')->default(false);
                $table->date('agreement_signed_date')->nullable();
                $table->string('agreement_version')->nullable();
                $table->decimal('commission_rate', 5, 2)->default(20);
                $table->integer('referrals_given')->default(0);
                $table->integer('qualified_referrals')->default(0);
                $table->integer('closed_won_deals')->default(0);
                $table->decimal('revenue_generated', 12, 2)->default(0);
                $table->decimal('total_commissions_earned', 12, 2)->default(0);
                $table->decimal('outstanding_commission_balance', 12, 2)->default(0);
                $table->date('last_commission_payout_date')->nullable();
                $table->date('last_referral_date')->nullable();
                $table->uuid('internal_owner_id')->nullable();
                $table->date('partner_start_date')->nullable();
                $table->timestamp('last_activity_date')->nullable();
                $table->date('next_follow_up_date')->nullable();
                $table->text('partner_notes')->nullable();
                $table->boolean('portal_access_enabled')->default(false);
                $table->uuid('linked_user_id')->nullable();
                $table->string('access_level')->default('standard');
                $table->timestamp('last_login_date')->nullable();
                $table->string('slug')->nullable()->unique();
                $table->boolean('email_verified')->default(false);
                $table->boolean('mfa_enabled')->default(false);
                $table->boolean('payout_email_confirmed')->default(false);
                $table->json('report_schedule')->nullable();
                $table->uuid('created_by')->nullable();
                $table->timestamps();
                $table->index('partner_status');
                $table->index('internal_owner_id');
            });
        }

        if (! Schema::hasTable('partner_settings')) {
            Schema::create('partner_settings', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->decimal('global_discount_percent', 5, 2)->default(0);
                $table->uuid('updated_by')->nullable();
                $table->timestamps();
            });

            DB::table('partner_settings')->insert([
                'id' => DB::raw($this->uuidSql()),
                'global_discount_percent' => 20,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        if (! Schema::hasTable('partner_users')) {
            Schema::create('partner_users', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('partner_id');
                $table->uuid('user_id');
                $table->string('role')->default('owner');
                $table->timestamp('created_at')->useCurrent();
                $table->unique(['partner_id', 'user_id']);
            });
        }

        if (! Schema::hasTable('referrals')) {
            Schema::create('referrals', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('partner_id');
                $table->string('lead_email');
                $table->string('lead_name')->nullable();
                $table->string('lead_phone')->nullable();
                $table->string('lead_company')->nullable();
                $table->string('source');
                $table->string('status')->default('new');
                $table->string('attribution_type')->default('last_touch');
                $table->text('landing_page')->nullable();
                $table->json('utm_params')->nullable();
                $table->uuid('deal_id')->nullable();
                $table->text('notes')->nullable();
                $table->timestamp('created_at')->useCurrent();
                $table->timestamp('converted_at')->nullable();
                $table->timestamp('updated_at')->useCurrent();
                $table->index('partner_id');
                $table->index('status');
                $table->index('lead_email');
            });
        }

        if (! Schema::hasTable('partner_deals')) {
            Schema::create('partner_deals', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('referral_id')->nullable();
                $table->uuid('partner_id');
                $table->uuid('client_id')->nullable();
                $table->string('client_name');
                $table->string('client_email')->nullable();
                $table->string('stage')->default('new');
                $table->decimal('deal_value', 12, 2)->default(0);
                $table->date('expected_close_date')->nullable();
                $table->timestamp('closed_at')->nullable();
                $table->text('notes')->nullable();
                $table->timestamps();
                $table->index('partner_id');
                $table->index('stage');
                $table->index('referral_id');
            });
        }

        if (! Schema::hasTable('partner_payments')) {
            Schema::create('partner_payments', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('deal_id')->nullable();
                $table->uuid('client_id')->nullable();
                $table->uuid('partner_id');
                $table->string('square_payment_id')->nullable()->unique();
                $table->decimal('amount', 12, 2);
                $table->string('currency')->default('USD');
                $table->string('status')->default('captured');
                $table->timestamp('captured_at')->nullable();
                $table->timestamp('refunded_at')->nullable();
                $table->timestamps();
                $table->index('partner_id');
                $table->index('deal_id');
                $table->index('status');
                $table->index('square_payment_id');
            });
        }

        if (! Schema::hasTable('partner_commissions')) {
            Schema::create('partner_commissions', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('partner_id');
                $table->uuid('deal_id')->nullable();
                $table->uuid('payment_id')->nullable();
                $table->decimal('commission_rate', 5, 4)->default(0.20);
                $table->decimal('gross_amount', 12, 2);
                $table->decimal('net_amount', 12, 2);
                $table->string('status')->default('pending');
                $table->timestamp('clawback_eligible_until')->nullable();
                $table->uuid('payout_id')->nullable();
                $table->timestamps();
                $table->index('partner_id');
                $table->index('status');
                $table->index('payout_id');
            });
        }

        if (! Schema::hasTable('partner_payout_methods')) {
            Schema::create('partner_payout_methods', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('partner_id');
                $table->string('method_type')->default('ach');
                $table->text('token_reference')->nullable();
                $table->string('last_four_digits')->nullable();
                $table->string('bank_name')->nullable();
                $table->boolean('is_default')->default(false);
                $table->boolean('is_verified')->default(false);
                $table->timestamps();
                $table->index('partner_id');
            });
        }

        if (! Schema::hasTable('partner_payouts')) {
            Schema::create('partner_payouts', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('partner_id');
                $table->date('period_start')->nullable();
                $table->date('period_end')->nullable();
                $table->decimal('gross_amount', 12, 2)->default(0);
                $table->decimal('net_amount', 12, 2)->default(0);
                $table->string('status')->default('pending');
                $table->uuid('payout_method_id')->nullable();
                $table->string('payout_reference')->nullable();
                $table->timestamp('processed_at')->nullable();
                $table->timestamps();
                $table->index('partner_id');
            });
        }

        if (! Schema::hasTable('partner_assets')) {
            Schema::create('partner_assets', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('title');
                $table->text('description')->nullable();
                $table->string('asset_type')->default('copy');
                $table->string('category')->default('copy');
                $table->text('file_url');
                $table->text('thumbnail_url')->nullable();
                $table->boolean('is_active')->default(true);
                $table->integer('display_order')->default(0);
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('partner_tickets')) {
            Schema::create('partner_tickets', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('partner_id');
                $table->string('subject');
                $table->string('status')->default('open');
                $table->string('priority')->default('medium');
                $table->timestamp('last_message_at')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('partner_ticket_messages')) {
            Schema::create('partner_ticket_messages', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('ticket_id');
                $table->uuid('sender_id')->nullable();
                $table->string('sender_type')->default('partner');
                $table->text('message');
                $table->json('attachments')->nullable();
                $table->timestamp('created_at')->useCurrent();
            });
        }

        if (! Schema::hasTable('partner_audit_logs')) {
            Schema::create('partner_audit_logs', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('partner_id');
                $table->string('event_type');
                $table->json('event_data')->nullable();
                $table->uuid('created_by')->nullable();
                $table->timestamp('created_at')->useCurrent();
            });
        }

        if (! Schema::hasTable('partner_scheduled_reports')) {
            Schema::create('partner_scheduled_reports', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('partner_id');
                $table->string('cadence')->default('monthly');
                $table->json('recipients')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamp('last_sent_at')->nullable();
                $table->timestamp('next_send_at')->nullable();
                $table->string('report_type')->default('combined');
                $table->boolean('format_pdf')->default(true);
                $table->boolean('format_csv')->default(true);
                $table->integer('day_of_week')->nullable();
                $table->integer('day_of_month')->nullable();
                $table->string('timezone')->default('America/Denver');
                $table->json('include_statuses')->nullable();
                $table->string('detail_level')->default('detailed');
                $table->string('email_to')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('report_runs')) {
            Schema::create('report_runs', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('report_id')->nullable();
                $table->uuid('partner_id');
                $table->timestamp('period_start');
                $table->timestamp('period_end');
                $table->timestamp('generated_at')->useCurrent();
                $table->string('status')->default('generated');
                $table->text('pdf_url')->nullable();
                $table->text('csv_commissions_url')->nullable();
                $table->text('csv_payouts_url')->nullable();
                $table->text('error_message')->nullable();
                $table->timestamp('created_at')->useCurrent();
                $table->index('partner_id');
                $table->index('report_id');
                $table->index('status');
            });
        }
    }

    private function uuidSql(): string
    {
        if (DB::getDriverName() === 'sqlite') {
            return "(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(6))))";
        }

        return '(UUID())';
    }

    public function down(): void
    {
        if (! in_array(DB::getDriverName(), ['mysql', 'sqlite'], true)) {
            return;
        }

        Schema::dropIfExists('report_runs');
        Schema::dropIfExists('partner_scheduled_reports');
        Schema::dropIfExists('partner_audit_logs');
        Schema::dropIfExists('partner_ticket_messages');
        Schema::dropIfExists('partner_tickets');
        Schema::dropIfExists('partner_assets');
        Schema::dropIfExists('partner_payouts');
        Schema::dropIfExists('partner_payout_methods');
        Schema::dropIfExists('partner_commissions');
        Schema::dropIfExists('partner_payments');
        Schema::dropIfExists('partner_deals');
        Schema::dropIfExists('referrals');
        Schema::dropIfExists('partner_users');
        Schema::dropIfExists('partner_settings');
        Schema::dropIfExists('partners');
        Schema::dropIfExists('agent_memory');
        Schema::dropIfExists('agent_conversations');
        Schema::dropIfExists('agent_access');
        Schema::dropIfExists('customer_subscriptions');
        Schema::dropIfExists('portal_tenants');
        Schema::dropIfExists('agent_suggestions');
        Schema::dropIfExists('portal_faq_items');
        Schema::dropIfExists('portal_integrations');
        Schema::dropIfExists('portal_roadmap_items');
        Schema::dropIfExists('portal_available_agents');
        Schema::dropIfExists('staff_hours');
        Schema::dropIfExists('staff');
    }
};
