<?php

use App\Models\AgentAccess;
use App\Models\PortalTenant;
use App\Models\User;
use Illuminate\Support\Str;

it('updates agent configuration for the tenant agent', function () {
    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
    ]);

    $agent = AgentAccess::query()->create([
        'id' => (string) Str::uuid(),
        'subscription_id' => null,
        'customer_id' => $tenant->id,
        'agent_type' => 'general',
        'agent_name' => 'Beacon',
        'configuration' => ['tone' => 'friendly'],
        'is_active' => true,
        'usage_count' => 0,
        'usage_limit' => 100,
        'last_used_at' => null,
        'tenant_id' => $tenant->id,
    ]);

    $payload = ['configuration' => ['tone' => 'direct', 'max_tokens' => 300]];

    $response = $this->actingAs($user)->putJson(
        "/api/portal/agents/{$agent->id}/configuration",
        $payload
    );

    $response->assertSuccessful();
    $response->assertJsonPath('success', true);

    $this->assertDatabaseHas('agent_access', [
        'id' => $agent->id,
        'tenant_id' => $tenant->id,
        'configuration' => json_encode($payload['configuration']),
    ]);
});

it('does not allow updating configuration for another tenant agent', function () {
    $owner = User::factory()->create();
    $ownerTenant = PortalTenant::factory()->create([
        'user_id' => (string) $owner->id,
    ]);

    $agent = AgentAccess::query()->create([
        'id' => (string) Str::uuid(),
        'subscription_id' => null,
        'customer_id' => $ownerTenant->id,
        'agent_type' => 'general',
        'agent_name' => 'Beacon',
        'configuration' => ['tone' => 'friendly'],
        'is_active' => true,
        'usage_count' => 0,
        'usage_limit' => 100,
        'last_used_at' => null,
        'tenant_id' => $ownerTenant->id,
    ]);

    $otherUser = User::factory()->create();
    PortalTenant::factory()->create([
        'user_id' => (string) $otherUser->id,
    ]);

    $response = $this->actingAs($otherUser)->putJson(
        "/api/portal/agents/{$agent->id}/configuration",
        ['configuration' => ['tone' => 'direct']]
    );

    $response->assertNotFound();
});
