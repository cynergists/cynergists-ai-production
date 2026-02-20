<?php

use App\Ai\Agents\Cynessa;
use App\Models\AgentAccess;
use App\Models\PortalAvailableAgent;
use App\Models\PortalTenant;
use App\Models\User;
use App\Services\Portal\AgentOnboardingService;
use Illuminate\Support\Str;

use function Pest\Laravel\actingAs;

/**
 * Helper: create a non-virtual agent access row for a tenant.
 */
function makeAgentAccess(PortalTenant $tenant, string $agentName = 'Apex'): AgentAccess
{
    return AgentAccess::create([
        'id' => (string) Str::uuid(),
        'subscription_id' => (string) Str::uuid(),
        'customer_id' => (string) Str::uuid(),
        'tenant_id' => $tenant->id,
        'agent_type' => 'assistant',
        'agent_name' => $agentName,
        'is_active' => true,
    ]);
}

it('blocks a non-Iris agent when Iris onboarding is not complete', function () {
    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
        'onboarding_completed_at' => null,
    ]);

    $agentAccess = makeAgentAccess($tenant, 'Apex');

    $response = actingAs($user)->postJson("/api/portal/agents/{$agentAccess->id}/message", [
        'message' => 'Hello',
    ]);

    $response->assertForbidden();
    $response->assertJsonPath('error', 'onboarding_required');
    $response->assertJsonPath('agent', 'iris');
});

it('blocks a non-Iris agent when agent onboarding is incomplete (Iris is complete)', function () {
    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
        'onboarding_completed_at' => now(), // legacy: Iris gate passes
    ]);

    $agentAccess = makeAgentAccess($tenant, 'Apex');

    // Apex onboarding state exists but is not completed
    /** @var AgentOnboardingService $service */
    $service = app(AgentOnboardingService::class);
    $service->markStarted($tenant, 'apex', $user);

    $response = actingAs($user)->postJson("/api/portal/agents/{$agentAccess->id}/message", [
        'message' => 'Hello',
    ]);

    $response->assertForbidden();
    $response->assertJsonPath('error', 'agent_onboarding_required');
    $response->assertJsonPath('agent', 'apex');
});

it('allows Iris to be messaged even when Iris onboarding is not complete', function () {
    Cynessa::fake(['Welcome! I am Iris, your onboarding guide.']);

    PortalAvailableAgent::create([
        'id' => (string) Str::uuid(),
        'name' => 'Cynessa',
        'description' => 'Onboarding Agent',
        'agent_type' => 'bot',
        'features' => [],
        'is_active' => true,
        'portal_available' => true,
    ]);

    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
        'onboarding_completed_at' => null,
    ]);

    $irisId = 'iris-' . $tenant->id;

    $response = actingAs($user)->postJson("/api/portal/agents/{$irisId}/message", [
        'message' => 'Hi',
    ]);

    $response->assertSuccessful();
});

it('allows Cynessa to be messaged even when Iris onboarding is not complete', function () {
    Cynessa::fake(['Hi! I am Cynessa.']);

    PortalAvailableAgent::create([
        'id' => (string) Str::uuid(),
        'name' => 'Cynessa',
        'description' => 'Onboarding Agent',
        'agent_type' => 'bot',
        'features' => [],
        'is_active' => true,
        'portal_available' => true,
    ]);

    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
        'onboarding_completed_at' => null,
    ]);

    $agentAccess = makeAgentAccess($tenant, 'Cynessa');

    $response = actingAs($user)->postJson("/api/portal/agents/{$agentAccess->id}/message", [
        'message' => 'Hello',
    ]);

    $response->assertSuccessful();
});

it('allows messaging a non-Iris agent after both gates are satisfied', function () {
    Cynessa::fake(['How can I help you today?']);

    PortalAvailableAgent::create([
        'id' => (string) Str::uuid(),
        'name' => 'Cynessa',
        'description' => 'Onboarding Agent',
        'agent_type' => 'bot',
        'features' => [],
        'is_active' => true,
        'portal_available' => true,
    ]);

    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
        'onboarding_completed_at' => now(), // Iris gate satisfied
    ]);

    /** @var AgentOnboardingService $service */
    $service = app(AgentOnboardingService::class);
    $agentAccess = makeAgentAccess($tenant, 'Apex');
    $service->markCompleted($tenant, 'apex', $user); // per-agent gate satisfied

    $response = actingAs($user)->postJson("/api/portal/agents/{$agentAccess->id}/message", [
        'message' => 'Hello',
    ]);

    $response->assertSuccessful();
});
