<?php

use App\Models\AgentAccess;
use App\Models\AgentConversation;
use App\Models\CustomerSubscription;
use App\Models\Partner;
use App\Models\PartnerCommission;
use App\Models\PartnerDeal;
use App\Models\PartnerPayment;
use App\Models\PartnerPayout;
use App\Models\PartnerPayoutMethod;
use App\Models\PartnerScheduledReport;
use App\Models\PartnerTicket;
use App\Models\PortalTenant;
use App\Models\ReportRun;
use App\Models\Staff;
use App\Models\StaffHour;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Tests\TestCase;

uses(TestCase::class);

it('defines staff relationships', function () {
    expect((new Staff)->hours())->toBeInstanceOf(HasMany::class);
    expect((new StaffHour)->staff())->toBeInstanceOf(BelongsTo::class);
});

it('defines portal tenant relationships', function () {
    $tenant = new PortalTenant;

    expect($tenant->user())->toBeInstanceOf(BelongsTo::class);
    expect($tenant->subscriptions())->toBeInstanceOf(HasMany::class);
    expect($tenant->agentAccesses())->toBeInstanceOf(HasMany::class);
    expect($tenant->agentConversations())->toBeInstanceOf(HasMany::class);
});

it('defines subscription and agent relationships', function () {
    expect((new CustomerSubscription)->tenant())->toBeInstanceOf(BelongsTo::class);
    expect((new CustomerSubscription)->agentAccesses())->toBeInstanceOf(HasMany::class);
    expect((new AgentAccess)->subscription())->toBeInstanceOf(BelongsTo::class);
    expect((new AgentAccess)->tenant())->toBeInstanceOf(BelongsTo::class);
    expect((new AgentAccess)->conversations())->toBeInstanceOf(HasMany::class);
    expect((new AgentConversation)->access())->toBeInstanceOf(BelongsTo::class);
    expect((new AgentConversation)->tenant())->toBeInstanceOf(BelongsTo::class);
});

it('defines partner relationships', function () {
    $partner = new Partner;

    expect($partner->users())->toBeInstanceOf(HasMany::class);
    expect($partner->referrals())->toBeInstanceOf(HasMany::class);
    expect($partner->deals())->toBeInstanceOf(HasMany::class);
    expect($partner->payments())->toBeInstanceOf(HasMany::class);
    expect($partner->commissions())->toBeInstanceOf(HasMany::class);
    expect($partner->payoutMethods())->toBeInstanceOf(HasMany::class);
    expect($partner->payouts())->toBeInstanceOf(HasMany::class);
    expect($partner->tickets())->toBeInstanceOf(HasMany::class);
    expect($partner->auditLogs())->toBeInstanceOf(HasMany::class);
    expect($partner->scheduledReports())->toBeInstanceOf(HasMany::class);
    expect($partner->reportRuns())->toBeInstanceOf(HasMany::class);
});

it('defines partner transaction relationships', function () {
    expect((new PartnerDeal)->partner())->toBeInstanceOf(BelongsTo::class);
    expect((new PartnerDeal)->referral())->toBeInstanceOf(BelongsTo::class);
    expect((new PartnerDeal)->payments())->toBeInstanceOf(HasMany::class);
    expect((new PartnerDeal)->commissions())->toBeInstanceOf(HasMany::class);
    expect((new PartnerPayment)->partner())->toBeInstanceOf(BelongsTo::class);
    expect((new PartnerPayment)->deal())->toBeInstanceOf(BelongsTo::class);
    expect((new PartnerPayment)->commissions())->toBeInstanceOf(HasMany::class);
    expect((new PartnerCommission)->partner())->toBeInstanceOf(BelongsTo::class);
    expect((new PartnerCommission)->deal())->toBeInstanceOf(BelongsTo::class);
    expect((new PartnerCommission)->payment())->toBeInstanceOf(BelongsTo::class);
    expect((new PartnerCommission)->payout())->toBeInstanceOf(BelongsTo::class);
});

it('defines partner payout and reporting relationships', function () {
    expect((new PartnerPayoutMethod)->partner())->toBeInstanceOf(BelongsTo::class);
    expect((new PartnerPayoutMethod)->payouts())->toBeInstanceOf(HasMany::class);
    expect((new PartnerPayout)->partner())->toBeInstanceOf(BelongsTo::class);
    expect((new PartnerPayout)->payoutMethod())->toBeInstanceOf(BelongsTo::class);
    expect((new PartnerPayout)->commissions())->toBeInstanceOf(HasMany::class);
    expect((new PartnerScheduledReport)->partner())->toBeInstanceOf(BelongsTo::class);
    expect((new PartnerScheduledReport)->runs())->toBeInstanceOf(HasMany::class);
    expect((new ReportRun)->partner())->toBeInstanceOf(BelongsTo::class);
    expect((new ReportRun)->report())->toBeInstanceOf(BelongsTo::class);
});

it('defines partner ticket relationships', function () {
    expect((new PartnerTicket)->partner())->toBeInstanceOf(BelongsTo::class);
    expect((new PartnerTicket)->messages())->toBeInstanceOf(HasMany::class);
});
