<?php

use App\Ai\Agents\Carbon;
use App\Models\AgentAccess;
use App\Models\PortalAvailableAgent;
use App\Models\PortalTenant;
use App\Models\User;
use Illuminate\Support\Str;

use function Pest\Laravel\actingAs;

it('sends a message to the carbon agent and gets a response', function () {
    Carbon::fake(['Hello! I can help with your SEO.']);

    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
        'company_name' => 'Test Company',
        'onboarding_completed_at' => now(),
    ]);

    $availableAgent = PortalAvailableAgent::create([
        'id' => (string) Str::uuid(),
        'name' => 'Carbon',
        'description' => 'SEO Agent',
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
        'agent_type' => 'seo',
        'agent_name' => 'Carbon',
        'is_active' => true,
    ]);

    $response = actingAs($user)->postJson("/api/portal/agents/{$agentAccess->id}/message", [
        'message' => 'How is my SEO doing?',
    ]);

    $response->assertSuccessful();
    $response->assertJsonPath('success', true);
    expect($response->json('assistantMessage'))->toBe('Hello! I can help with your SEO.');

    Carbon::assertPrompted('How is my SEO doing?');
});

it('builds carbon agent instructions with seo context', function () {
    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
        'company_name' => 'Test Company',
        'onboarding_completed_at' => now(),
    ]);

    $agent = new Carbon(
        user: $user,
        tenant: $tenant,
    );

    $instructions = $agent->instructions();

    expect((string) $instructions)->toContain('You are Carbon, an SEO expert agent');
    expect((string) $instructions)->toContain('CURRENT SEO STATUS');
    expect((string) $instructions)->toContain('SITES BEING MONITORED');
});

it('maps conversation history to messages', function () {
    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
    ]);

    $history = [
        ['role' => 'user', 'content' => 'Hello'],
        ['role' => 'assistant', 'content' => 'Hi there!'],
    ];

    $agent = new Carbon(
        user: $user,
        tenant: $tenant,
        conversationHistory: $history,
    );

    $messages = iterator_to_array($agent->messages());

    expect($messages)->toHaveCount(2);
    expect($messages[0]->role->value)->toBe('user');
    expect($messages[0]->content)->toBe('Hello');
    expect($messages[1]->role->value)->toBe('assistant');
    expect($messages[1]->content)->toBe('Hi there!');
});
