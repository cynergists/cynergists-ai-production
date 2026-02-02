<?php

use App\Models\AgentAccess;
use App\Models\CustomerSubscription;
use App\Models\PortalAvailableAgent;
use App\Models\PortalTenant;
use App\Models\User;
use App\Services\AgentAttachmentService;

beforeEach(function () {
    // Create available agents in the database
    PortalAvailableAgent::factory()->create([
        'name' => 'Sales Agent',
        'is_active' => true,
    ]);
    PortalAvailableAgent::factory()->create([
        'name' => 'Support Agent',
        'is_active' => true,
    ]);
    PortalAvailableAgent::factory()->create([
        'name' => 'Analytics Agent',
        'is_active' => true,
    ]);
});

it('attaches purchased agents to user via service', function () {
    $user = User::factory()->create(['email' => 'customer@example.com']);
    $purchasedAgents = ['Sales Agent', 'Support Agent'];

    $service = app(AgentAttachmentService::class);
    $result = $service->attachAgentsToUser($user->email, $purchasedAgents);

    expect($result['success'])->toBeTrue();
    expect($result['agents_attached'])->toBe(2);
    expect($result['tenant_id'])->not->toBeNull();

    // Verify tenant was created
    $tenant = PortalTenant::where('user_id', $user->id)->first();
    expect($tenant)->not->toBeNull();
    expect($tenant->user_id)->toBe((string) $user->id);

    // Verify subscription was created
    $subscription = CustomerSubscription::where('tenant_id', $tenant->id)->first();
    expect($subscription)->not->toBeNull();
    expect($subscription->tier)->toBe('starter');

    // Verify only purchased agents were attached
    expect(AgentAccess::where('tenant_id', $tenant->id)->count())->toBe(2);

    $attachedAgentNames = AgentAccess::where('tenant_id', $tenant->id)
        ->pluck('agent_name')
        ->toArray();

    expect($attachedAgentNames)->toEqualCanonicalizing($purchasedAgents);
});

it('only attaches specified agents via service', function () {
    $user = User::factory()->create(['email' => 'selective@example.com']);
    $purchasedAgents = ['Sales Agent']; // Only one agent purchased

    $service = app(AgentAttachmentService::class);
    $result = $service->attachAgentsToUser($user->email, $purchasedAgents);

    expect($result['success'])->toBeTrue();
    expect($result['agents_attached'])->toBe(1);

    $tenant = PortalTenant::where('user_id', $user->id)->first();
    expect($tenant)->not->toBeNull();

    // Verify only Sales Agent was attached
    expect(AgentAccess::where('tenant_id', $tenant->id)->count())->toBe(1);

    $attachedAgent = AgentAccess::where('tenant_id', $tenant->id)->first();
    expect($attachedAgent->agent_name)->toBe('Sales Agent');
});

it('handles non-existent user gracefully', function () {
    $service = app(AgentAttachmentService::class);
    $result = $service->attachAgentsToUser('nonexistent@example.com', ['Sales Agent']);

    expect($result['success'])->toBeFalse();
    expect($result['message'])->toContain('User not found');
    expect($result['agents_attached'])->toBe(0);
});

it('creates tenant if not exists', function () {
    $user = User::factory()->create(['email' => 'newtenant@example.com']);

    // Verify no tenant exists yet
    expect(PortalTenant::where('user_id', $user->id)->first())->toBeNull();

    $service = app(AgentAttachmentService::class);
    $result = $service->attachAgentsToUser($user->email, ['Support Agent']);

    expect($result['success'])->toBeTrue();

    // Verify tenant was created
    $tenant = PortalTenant::where('user_id', $user->id)->first();
    expect($tenant)->not->toBeNull();
    expect($tenant->user_id)->toBe((string) $user->id);
    expect($tenant->id)->not->toBeNull();
});

it('attaches all active agents when no agent names provided', function () {
    $user = User::factory()->create(['email' => 'allactive@example.com']);

    $service = app(AgentAttachmentService::class);
    $result = $service->attachAgentsToUser($user->email, null); // null = all active agents

    expect($result['success'])->toBeTrue();
    expect($result['agents_attached'])->toBe(3); // All 3 active agents from beforeEach

    $tenant = PortalTenant::where('user_id', $user->id)->first();
    expect(AgentAccess::where('tenant_id', $tenant->id)->count())->toBe(3);
});
