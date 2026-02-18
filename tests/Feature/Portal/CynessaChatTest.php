<?php

use App\Ai\Agents\Cynessa;
use App\Models\AgentAccess;
use App\Models\AgentConversation;
use App\Models\PortalAvailableAgent;
use App\Models\PortalTenant;
use App\Models\User;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;

it('handles cynessa greeting message', function () {
    Cynessa::fake(['Hi John! I\'m Cynessa, your AI assistant. How can I help you today?']);

    $user = User::factory()->create(['name' => 'John Doe']);
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
        'company_name' => 'Test Company',
    ]);

    // Create the available agent
    $availableAgent = PortalAvailableAgent::create([
        'id' => (string) Str::uuid(),
        'name' => 'Cynessa',
        'description' => 'Onboarding Agent',
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
        'agent_type' => 'onboarding',
        'agent_name' => 'Cynessa',
        'is_active' => true,
    ]);

    Sanctum::actingAs($user);
    $response = $this->postJson("/api/portal/agents/{$agentAccess->id}/message", [
        'message' => 'Hello',
    ]);

    $response->assertSuccessful();
    $response->assertJsonPath('success', true);
    expect($response->json('assistantMessage'))->toBe('Hi John! I\'m Cynessa, your AI assistant. How can I help you today?');

    Cynessa::assertPrompted('Hello');
});

it('handles cynessa onboarding start', function () {
    Cynessa::fake(["Welcome! Let's get you set up. What is your company name?"]);

    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
        'onboarding_completed_at' => null,
    ]);

    // Create the available agent
    $availableAgent = PortalAvailableAgent::create([
        'id' => (string) Str::uuid(),
        'name' => 'Cynessa',
        'description' => 'Onboarding Agent',
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
        'agent_type' => 'onboarding',
        'agent_name' => 'Cynessa',
        'is_active' => true,
    ]);

    Sanctum::actingAs($user);
    $response = $this->postJson("/api/portal/agents/{$agentAccess->id}/message", [
        'message' => 'I want to get started',
    ]);

    $response->assertSuccessful();
    expect($response->json('assistantMessage'))->toBe("Welcome! Let's get you set up. What is your company name?");

    Cynessa::assertPrompted('I want to get started');
});

it('handles cynessa help request', function () {
    Cynessa::fake(['I can help you with your Onboarding process and File Management. What would you like to know?']);

    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
    ]);

    // Create the available agent
    $availableAgent = PortalAvailableAgent::create([
        'id' => (string) Str::uuid(),
        'name' => 'Cynessa',
        'description' => 'Onboarding Agent',
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
        'agent_type' => 'onboarding',
        'agent_name' => 'Cynessa',
        'is_active' => true,
    ]);

    Sanctum::actingAs($user);
    $response = $this->postJson("/api/portal/agents/{$agentAccess->id}/message", [
        'message' => 'help',
    ]);

    $response->assertSuccessful();
    expect($response->json('assistantMessage'))->toBe('I can help you with your Onboarding process and File Management. What would you like to know?');

    Cynessa::assertPrompted('help');
});

it('detects completed onboarding', function () {
    Cynessa::fake(["You've already completed onboarding! How can I help you today?"]);

    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
        'onboarding_completed_at' => now(),
    ]);

    // Create the available agent
    $availableAgent = PortalAvailableAgent::create([
        'id' => (string) Str::uuid(),
        'name' => 'Cynessa',
        'description' => 'Onboarding Agent',
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
        'agent_type' => 'onboarding',
        'agent_name' => 'Cynessa',
        'is_active' => true,
    ]);

    Sanctum::actingAs($user);
    $response = $this->postJson("/api/portal/agents/{$agentAccess->id}/message", [
        'message' => 'I want to get started',
    ]);

    $response->assertSuccessful();
    expect($response->json('assistantMessage'))->toBe("You've already completed onboarding! How can I help you today?");

    Cynessa::assertPrompted('I want to get started');
});

it('extracts company information from message', function () {
    Cynessa::fake(['Great, Acme Corp in the technology industry! What is your website URL?

[DATA: company_name="Acme Corp" industry="technology"]']);

    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
        'company_name' => 'Unknown',
        'settings' => [],
    ]);

    // Create the available agent
    $availableAgent = PortalAvailableAgent::create([
        'id' => (string) Str::uuid(),
        'name' => 'Cynessa',
        'description' => 'Onboarding Agent',
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
        'agent_type' => 'onboarding',
        'agent_name' => 'Cynessa',
        'is_active' => true,
    ]);

    Sanctum::actingAs($user);
    $response = $this->postJson("/api/portal/agents/{$agentAccess->id}/message", [
        'message' => 'My company is Acme Corp and we are in the technology industry',
    ]);

    $response->assertSuccessful();

    // DATA markers should be stripped from user-facing response
    $assistantMessage = $response->json('assistantMessage');
    expect($assistantMessage)->toBe('Great, Acme Corp in the technology industry! What is your website URL?');

    // Verify the tenant was updated via data extraction
    $tenant->refresh();
    expect($tenant->company_name)->toBe('Acme Corp');
    expect($tenant->settings['industry'] ?? null)->toBe('technology');

    Cynessa::assertPrompted('My company is Acme Corp and we are in the technology industry');
});

it('resets onboarding when user explicitly requests to start onboarding', function () {
    Cynessa::fake(["No problem! Let's start fresh. What is your company name?"]);

    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
        'company_name' => 'Existing Company',
        'onboarding_completed_at' => now(),
        'settings' => [
            'industry' => 'Technology',
            'services_needed' => 'SEO',
            'brand_tone' => 'Professional',
        ],
    ]);

    // Create the available agent
    $availableAgent = PortalAvailableAgent::create([
        'id' => (string) Str::uuid(),
        'name' => 'Cynessa',
        'description' => 'Onboarding Agent',
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
        'agent_type' => 'onboarding',
        'agent_name' => 'Cynessa',
        'is_active' => true,
    ]);

    Sanctum::actingAs($user);
    $response = $this->postJson("/api/portal/agents/{$agentAccess->id}/message", [
        'message' => 'I want to start onboarding',
    ]);

    $response->assertSuccessful();

    // Verify onboarding was reset
    $tenant->refresh();
    expect($tenant->onboarding_completed_at)->toBeNull();
    expect($tenant->settings)->toBeEmpty();

    // The response should be our faked message
    expect($response->json('assistantMessage'))->toBe("No problem! Let's start fresh. What is your company name?");

    Cynessa::assertPrompted('I want to start onboarding');
});

it('bounds conversation history before prompting cynessa', function () {
    Cynessa::fake(['History bounded successfully.']);

    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
    ]);

    PortalAvailableAgent::create([
        'id' => (string) Str::uuid(),
        'name' => 'Cynessa',
        'description' => 'Onboarding Agent',
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
        'agent_type' => 'onboarding',
        'agent_name' => 'Cynessa',
        'is_active' => true,
    ]);

    $messages = [];

    for ($i = 0; $i < 40; $i++) {
        $messages[] = [
            'role' => $i % 2 === 0 ? 'user' : 'assistant',
            'content' => "history-{$i} ".str_repeat('x', 1200),
        ];
    }

    AgentConversation::query()->create([
        'id' => (string) Str::uuid(),
        'agent_access_id' => $agentAccess->id,
        'customer_id' => (string) $tenant->id,
        'title' => 'Existing Conversation',
        'messages' => $messages,
        'status' => 'active',
        'tenant_id' => $tenant->id,
    ]);

    Sanctum::actingAs($user);
    $response = $this->postJson("/api/portal/agents/{$agentAccess->id}/message", [
        'message' => 'New prompt',
    ]);

    $response->assertSuccessful();
    expect($response->json('assistantMessage'))->toBe('History bounded successfully.');

    Cynessa::assertPrompted(function ($prompt) {
        $history = $prompt->agent->conversationHistory;
        $totalCharacters = array_sum(array_map(
            fn (array $message): int => mb_strlen($message['content']),
            $history
        ));

        return count($history) <= 24
            && $totalCharacters <= 48000
            && str_contains($history[array_key_last($history)]['content'], 'history-39');
    });
});
