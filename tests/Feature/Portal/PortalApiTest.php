<?php

use App\Models\AgentAccess;
use App\Models\AgentConversation;
use App\Models\CustomerSubscription;
use App\Models\PortalTenant;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Support\Str;

it('returns portal stats and agents for the authenticated tenant', function () {
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

    $agentAccess = AgentAccess::query()->create([
        'id' => (string) Str::uuid(),
        'subscription_id' => $subscription->id,
        'customer_id' => $tenant->id,
        'agent_type' => 'general',
        'agent_name' => 'Beacon',
        'configuration' => [],
        'is_active' => true,
        'usage_count' => 5,
        'usage_limit' => 100,
        'last_used_at' => now()->subHour(),
        'tenant_id' => $tenant->id,
    ]);

    AgentConversation::query()->create([
        'id' => (string) Str::uuid(),
        'agent_access_id' => $agentAccess->id,
        'customer_id' => $tenant->id,
        'title' => 'Test Conversation',
        'messages' => [],
        'status' => 'active',
        'tenant_id' => $tenant->id,
    ]);

    $statsResponse = $this->actingAs($user)->getJson('/api/portal/stats');
    $statsResponse->assertSuccessful();
    $statsResponse->assertJson([
        'agentCount' => 1,
        'conversationCount' => 1,
        'totalMessages' => 5,
    ]);

    $agentsResponse = $this->actingAs($user)->getJson('/api/portal/agents');
    $agentsResponse->assertSuccessful();
    $agentsResponse->assertJsonCount(1, 'agents');
    $agentsResponse->assertJsonPath('agents.0.agent_name', 'Beacon');
});

it('claims a portal subdomain', function () {
    $user = User::factory()->create();
    PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
        'subdomain' => 'temp-subdomain',
        'is_temp_subdomain' => true,
    ]);

    $response = $this->actingAs($user)->postJson('/api/portal/tenant/claim-subdomain', [
        'subdomain' => 'mike-test',
    ]);

    $response->assertSuccessful();
    $response->assertJson(['success' => true]);

    $this->assertDatabaseHas('portal_tenants', [
        'user_id' => (string) $user->id,
        'subdomain' => 'mike-test',
        'is_temp_subdomain' => 0,
    ]);
});
