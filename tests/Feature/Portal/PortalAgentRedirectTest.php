<?php

use App\Models\AgentAccess;
use App\Models\CustomerSubscription;
use App\Models\PortalAvailableAgent;
use App\Models\PortalTenant;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Support\Str;

it('returns redirect_url for agents that have one', function () {
    $user = User::factory()->create();
    UserRole::factory()->create([
        'user_id' => $user->id,
        'role' => 'client',
    ]);

    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
        'subdomain' => 'portal-test',
        'is_temp_subdomain' => false,
    ]);

    $subscription = CustomerSubscription::query()->create([
        'id' => (string) Str::uuid(),
        'customer_id' => $tenant->id,
        'product_id' => (string) Str::uuid(),
        'payment_id' => null,
        'status' => 'active',
        'tier' => 'pro',
        'start_date' => now()->subDay(),
        'end_date' => now()->addMonth(),
        'auto_renew' => true,
        'tenant_id' => $tenant->id,
    ]);

    $availableAgent = PortalAvailableAgent::factory()->withRedirect('https://apex.cynergists.com')->create([
        'name' => 'Apex',
    ]);

    $agentAccess = AgentAccess::query()->create([
        'id' => (string) Str::uuid(),
        'subscription_id' => $subscription->id,
        'customer_id' => $tenant->id,
        'agent_type' => 'general',
        'agent_name' => $availableAgent->name,
        'configuration' => [],
        'is_active' => true,
        'usage_count' => 0,
        'usage_limit' => 100,
        'last_used_at' => null,
        'tenant_id' => $tenant->id,
    ]);

    $response = $this->actingAs($user)->getJson('/api/portal/agents');

    $response->assertSuccessful();
    $response->assertJsonCount(1, 'agents');
    $response->assertJsonPath('agents.0.redirect_url', 'https://apex.cynergists.com');
});

it('returns null redirect_url for agents without one', function () {
    $user = User::factory()->create();
    UserRole::factory()->create([
        'user_id' => $user->id,
        'role' => 'client',
    ]);

    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
        'subdomain' => 'portal-test',
        'is_temp_subdomain' => false,
    ]);

    $subscription = CustomerSubscription::query()->create([
        'id' => (string) Str::uuid(),
        'customer_id' => $tenant->id,
        'product_id' => (string) Str::uuid(),
        'payment_id' => null,
        'status' => 'active',
        'tier' => 'pro',
        'start_date' => now()->subDay(),
        'end_date' => now()->addMonth(),
        'auto_renew' => true,
        'tenant_id' => $tenant->id,
    ]);

    $availableAgent = PortalAvailableAgent::factory()->create([
        'name' => 'Beacon',
        'redirect_url' => null,
    ]);

    $agentAccess = AgentAccess::query()->create([
        'id' => (string) Str::uuid(),
        'subscription_id' => $subscription->id,
        'customer_id' => $tenant->id,
        'agent_type' => 'general',
        'agent_name' => $availableAgent->name,
        'configuration' => [],
        'is_active' => true,
        'usage_count' => 0,
        'usage_limit' => 100,
        'last_used_at' => null,
        'tenant_id' => $tenant->id,
    ]);

    $response = $this->actingAs($user)->getJson('/api/portal/agents');

    $response->assertSuccessful();
    $response->assertJsonCount(1, 'agents');
    $response->assertJsonPath('agents.0.redirect_url', null);
});

it('includes redirect_url in single agent show endpoint', function () {
    $user = User::factory()->create();
    UserRole::factory()->create([
        'user_id' => $user->id,
        'role' => 'client',
    ]);

    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
        'subdomain' => 'portal-test',
        'is_temp_subdomain' => false,
    ]);

    $subscription = CustomerSubscription::query()->create([
        'id' => (string) Str::uuid(),
        'customer_id' => $tenant->id,
        'product_id' => (string) Str::uuid(),
        'payment_id' => null,
        'status' => 'active',
        'tier' => 'pro',
        'start_date' => now()->subDay(),
        'end_date' => now()->addMonth(),
        'auto_renew' => true,
        'tenant_id' => $tenant->id,
    ]);

    $availableAgent = PortalAvailableAgent::factory()->withRedirect('https://apex.cynergists.com')->create([
        'name' => 'Apex',
    ]);

    $agentAccess = AgentAccess::query()->create([
        'id' => (string) Str::uuid(),
        'subscription_id' => $subscription->id,
        'customer_id' => $tenant->id,
        'agent_type' => 'general',
        'agent_name' => $availableAgent->name,
        'configuration' => [],
        'is_active' => true,
        'usage_count' => 0,
        'usage_limit' => 100,
        'last_used_at' => null,
        'tenant_id' => $tenant->id,
    ]);

    $response = $this->actingAs($user)->getJson("/api/portal/agents/{$agentAccess->id}");

    $response->assertSuccessful();
    $response->assertJsonPath('agent.redirect_url', 'https://apex.cynergists.com');
});
