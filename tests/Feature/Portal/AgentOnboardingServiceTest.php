<?php

use App\Models\AgentOnboardingState;
use App\Models\OnboardingAuditLog;
use App\Models\PortalTenant;
use App\Models\User;
use App\Services\Portal\AgentOnboardingService;

it('returns false for isIrisComplete when no state exists', function () {
    $tenant = PortalTenant::factory()->create(['onboarding_completed_at' => null]);

    $service = app(AgentOnboardingService::class);

    expect($service->isIrisComplete($tenant))->toBeFalse();
});

it('returns true for isIrisComplete with legacy onboarding_completed_at', function () {
    $tenant = PortalTenant::factory()->create(['onboarding_completed_at' => now()]);

    $service = app(AgentOnboardingService::class);

    expect($service->isIrisComplete($tenant))->toBeTrue();
});

it('returns true for isIrisComplete when iris state is completed', function () {
    $tenant = PortalTenant::factory()->create(['onboarding_completed_at' => null]);
    $user = User::factory()->create();

    $service = app(AgentOnboardingService::class);
    $service->markCompleted($tenant, 'iris', $user);

    expect($service->isIrisComplete($tenant))->toBeTrue();
});

it('creates state row on getOrCreateState', function () {
    $tenant = PortalTenant::factory()->create();

    $service = app(AgentOnboardingService::class);
    $state = $service->getOrCreateState($tenant, 'apex');

    expect($state->tenant_id)->toBe($tenant->id);
    expect($state->agent_name)->toBe('apex');
    expect($state->state)->toBe('not_started');
});

it('returns false for isComplete when no state exists', function () {
    $tenant = PortalTenant::factory()->create();

    $service = app(AgentOnboardingService::class);

    expect($service->isComplete($tenant, 'apex'))->toBeFalse();
});

it('returns false for isComplete when state is in_progress', function () {
    $tenant = PortalTenant::factory()->create();
    $user = User::factory()->create();

    $service = app(AgentOnboardingService::class);
    $service->markStarted($tenant, 'apex', $user);

    expect($service->isComplete($tenant, 'apex'))->toBeFalse();
});

it('returns true for isComplete after markCompleted', function () {
    $tenant = PortalTenant::factory()->create();
    $user = User::factory()->create();

    $service = app(AgentOnboardingService::class);
    $service->markCompleted($tenant, 'apex', $user);

    expect($service->isComplete($tenant, 'apex'))->toBeTrue();
});

it('sets correct state on markStarted', function () {
    $tenant = PortalTenant::factory()->create();
    $user = User::factory()->create();

    $service = app(AgentOnboardingService::class);
    $state = $service->markStarted($tenant, 'apex', $user);

    expect($state->state)->toBe('in_progress');
    expect($state->started_at)->not->toBeNull();
});

it('does not regress already in_progress state on duplicate markStarted', function () {
    $tenant = PortalTenant::factory()->create();
    $user = User::factory()->create();

    $service = app(AgentOnboardingService::class);
    $service->markStarted($tenant, 'apex', $user);
    $first = $service->getOrCreateState($tenant, 'apex');

    $service->markStarted($tenant, 'apex', $user);
    $second = $service->getOrCreateState($tenant, 'apex');

    expect($second->started_at->toDateTimeString())->toBe($first->started_at->toDateTimeString());
});

it('sets completed state and timestamp on markCompleted', function () {
    $tenant = PortalTenant::factory()->create();
    $user = User::factory()->create();

    $service = app(AgentOnboardingService::class);
    $state = $service->markCompleted($tenant, 'apex', $user);

    expect($state->state)->toBe('completed');
    expect($state->completed_at)->not->toBeNull();
});

it('deletes state on reset', function () {
    $tenant = PortalTenant::factory()->create();
    $user = User::factory()->create();

    $service = app(AgentOnboardingService::class);
    $service->markCompleted($tenant, 'apex', $user);

    expect(AgentOnboardingState::where('tenant_id', $tenant->id)->where('agent_name', 'apex')->exists())->toBeTrue();

    $service->reset($tenant, 'apex', $user);

    expect(AgentOnboardingState::where('tenant_id', $tenant->id)->where('agent_name', 'apex')->exists())->toBeFalse();
});

it('writes audit log on markStarted', function () {
    $tenant = PortalTenant::factory()->create();
    $user = User::factory()->create();

    $service = app(AgentOnboardingService::class);
    $service->markStarted($tenant, 'apex', $user);

    $log = OnboardingAuditLog::where('tenant_id', $tenant->id)
        ->where('agent_name', 'apex')
        ->where('event', 'onboarding_started')
        ->first();

    expect($log)->not->toBeNull();
    expect($log->user_id)->toBe($user->id);
});

it('writes audit log on markCompleted', function () {
    $tenant = PortalTenant::factory()->create();
    $user = User::factory()->create();

    $service = app(AgentOnboardingService::class);
    $service->markCompleted($tenant, 'apex', $user);

    $log = OnboardingAuditLog::where('tenant_id', $tenant->id)
        ->where('event', 'onboarding_completed')
        ->first();

    expect($log)->not->toBeNull();
});

it('writes audit log on reset with reset_by metadata', function () {
    $tenant = PortalTenant::factory()->create();
    $user = User::factory()->create();

    $service = app(AgentOnboardingService::class);
    $service->reset($tenant, 'apex', $user);

    $log = OnboardingAuditLog::where('tenant_id', $tenant->id)
        ->where('event', 'onboarding_reset')
        ->first();

    expect($log)->not->toBeNull();
    expect($log->metadata['reset_by'])->toBe($user->id);
});

it('getAllStates returns all states for the tenant', function () {
    $tenant = PortalTenant::factory()->create();
    $user = User::factory()->create();

    $service = app(AgentOnboardingService::class);
    $service->markCompleted($tenant, 'apex', $user);
    $service->markStarted($tenant, 'carbon', $user);

    $states = $service->getAllStates($tenant);

    expect($states)->toHaveCount(2);
    expect($states->pluck('state', 'agent_name')->toArray())->toMatchArray([
        'apex' => 'completed',
        'carbon' => 'in_progress',
    ]);
});
