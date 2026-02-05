<?php

use App\Models\AgentAccess;
use App\Models\PortalAvailableAgent;
use App\Models\PortalTenant;
use App\Models\User;
use Illuminate\Support\Str;
use function Pest\Laravel\actingAs;
use function Pest\Laravel\postJson;

it('handles cynessa greeting message', function () {
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

    $response = actingAs($user)->postJson("/api/portal/agents/{$agentAccess->id}/message", [
        'message' => 'Hello',
    ]);

    $response->assertSuccessful();
    $response->assertJsonPath('success', true);
    
    $assistantMessage = $response->json('assistantMessage');
    expect($assistantMessage)->toContain('John');
    expect($assistantMessage)->toContain('Cynessa');
});

it('handles cynessa onboarding start', function () {
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

    $response = actingAs($user)->postJson("/api/portal/agents/{$agentAccess->id}/message", [
        'message' => 'I want to get started',
    ]);

    $response->assertSuccessful();
    
    $assistantMessage = $response->json('assistantMessage');
    expect($assistantMessage)->toContain('Company Information');
    expect($assistantMessage)->toContain('Company name');
});

it('handles cynessa help request', function () {
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

    $response = actingAs($user)->postJson("/api/portal/agents/{$agentAccess->id}/message", [
        'message' => 'help',
    ]);

    $response->assertSuccessful();
    
    $assistantMessage = $response->json('assistantMessage');
    expect($assistantMessage)->toContain('Onboarding');
    expect($assistantMessage)->toContain('File Management');
});

it('detects completed onboarding', function () {
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

    $response = actingAs($user)->postJson("/api/portal/agents/{$agentAccess->id}/message", [
        'message' => 'I want to get started',
    ]);

    $response->assertSuccessful();
    
    $assistantMessage = $response->json('assistantMessage');
    expect($assistantMessage)->toContain('already completed onboarding');
});

it('extracts company information from message', function () {
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

    $response = actingAs($user)->postJson("/api/portal/agents/{$agentAccess->id}/message", [
        'message' => 'My company is Acme Corp and we are in the technology industry',
    ]);

    $response->assertSuccessful();
    
    $assistantMessage = $response->json('assistantMessage');
    expect($assistantMessage)->toContain('Acme Corp');
    expect($assistantMessage)->toContain('technology');

    // Verify the tenant was updated
    $tenant->refresh();
    expect($tenant->company_name)->toBe('Acme Corp');
    expect($tenant->settings['industry'] ?? null)->toBe('technology');
});
