<?php

use App\Models\AgentAccess;
use App\Models\CustomerSubscription;
use App\Models\PortalTenant;
use App\Models\Profile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function createUserWithTenantAndAgent(string $agentName = 'Apex', bool $isActive = true): array
{
    $user = User::factory()->create();
    $profile = Profile::factory()->create(['user_id' => $user->id]);
    $tenant = PortalTenant::factory()->create(['user_id' => $user->id]);
    $subscription = CustomerSubscription::factory()->create(['tenant_id' => $tenant->id]);
    $agent = AgentAccess::factory()->create([
        'tenant_id' => $tenant->id,
        'subscription_id' => $subscription->id,
        'agent_name' => $agentName,
        'is_active' => $isActive,
    ]);

    return compact('user', 'profile', 'tenant', 'subscription', 'agent');
}

it('returns account data for authenticated user with tenant', function () {
    $data = createUserWithTenantAndAgent();

    $response = $this->actingAs($data['user'])->getJson('/api/portal/account');

    $response->assertSuccessful()
        ->assertJsonStructure([
            'profile' => ['first_name', 'last_name', 'company_name'],
            'agents',
        ]);

    expect($response->json('agents'))->toHaveCount(1);
    expect($response->json('agents.0.agent_name'))->toBe('Apex');
});

it('returns empty data when user has no tenant', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->getJson('/api/portal/account');

    $response->assertSuccessful();
    expect($response->json('profile'))->toBeNull();
    expect($response->json('agents'))->toBeEmpty();
});

it('successfully unsubscribes from an active agent', function () {
    $data = createUserWithTenantAndAgent();

    $response = $this->actingAs($data['user'])
        ->postJson("/api/portal/account/unsubscribe/{$data['agent']->id}");

    $response->assertSuccessful();
    expect($response->json('success'))->toBeTrue();

    $data['agent']->refresh();
    expect($data['agent']->is_active)->toBeFalse();
});

it('returns 404 when unsubscribing from non-existent agent', function () {
    $data = createUserWithTenantAndAgent();
    $fakeId = (string) \Illuminate\Support\Str::uuid();

    $response = $this->actingAs($data['user'])
        ->postJson("/api/portal/account/unsubscribe/{$fakeId}");

    $response->assertNotFound();
});

it('returns 404 when unsubscribing from already inactive agent', function () {
    $data = createUserWithTenantAndAgent(isActive: false);

    $response = $this->actingAs($data['user'])
        ->postJson("/api/portal/account/unsubscribe/{$data['agent']->id}");

    $response->assertNotFound();
});

it('prevents unsubscribing from another tenants agent', function () {
    $dataA = createUserWithTenantAndAgent();
    $dataB = createUserWithTenantAndAgent();

    $response = $this->actingAs($dataB['user'])
        ->postJson("/api/portal/account/unsubscribe/{$dataA['agent']->id}");

    $response->assertNotFound();
});

it('prevents unsubscribing from Cynessa', function () {
    $data = createUserWithTenantAndAgent('Cynessa');

    $response = $this->actingAs($data['user'])
        ->postJson("/api/portal/account/unsubscribe/{$data['agent']->id}");

    $response->assertForbidden();
});

it('renders the portal account page', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/portal/account');

    $response->assertSuccessful();
});
