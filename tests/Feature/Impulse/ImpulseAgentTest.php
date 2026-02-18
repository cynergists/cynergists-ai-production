<?php

use App\Ai\Agents\Impulse;
use App\Models\AgentAccess;
use App\Models\PortalAvailableAgent;
use App\Models\PortalTenant;
use App\Models\User;
use Illuminate\Support\Str;

use function Pest\Laravel\actingAs;

it('sends a message to the impulse agent and gets a response', function () {
    Impulse::fake(['Impulse is ready to automate your TikTok Shop content pipeline.']);

    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
        'company_name' => 'Test Company',
        'onboarding_completed_at' => now(),
    ]);

    PortalAvailableAgent::create([
        'id' => (string) Str::uuid(),
        'name' => 'Impulse',
        'description' => 'TikTok Shop automation agent',
        'agent_type' => 'bot',
        'features' => [],
        'is_active' => true,
        'portal_available' => true,
    ]);

    $agentAccess = AgentAccess::create([
        'id' => (string) Str::uuid(),
        'subscription_id' => (string) Str::uuid(),
        'customer_id' => (string) Str::uuid(),
        'tenant_id' => $tenant->id,
        'agent_type' => 'commerce',
        'agent_name' => 'Impulse',
        'is_active' => true,
    ]);

    $response = actingAs($user)->postJson("/api/portal/agents/{$agentAccess->id}/message", [
        'message' => 'Create a TikTok video plan for my top SKUs.',
    ]);

    $response->assertSuccessful();
    $response->assertJsonPath('success', true);
    expect($response->json('assistantMessage'))
        ->toBe('Impulse is ready to automate your TikTok Shop content pipeline.');

    Impulse::assertPrompted('Create a TikTok video plan for my top SKUs.');
});
