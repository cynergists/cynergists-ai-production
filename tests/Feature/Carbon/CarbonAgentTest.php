<?php

use App\Ai\Agents\Carbon;
use App\Ai\Tools\TriggerSeoAuditTool;
use App\Models\AgentAccess;
use App\Models\PortalAvailableAgent;
use App\Models\PortalTenant;
use App\Models\SeoSite;
use App\Models\User;
use Illuminate\Support\Str;
use Laravel\Ai\Contracts\HasTools;

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
    expect((string) $instructions)->toContain('NEVER invent or fabricate');
});

it('shows no audits message when no audit data exists', function () {
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

    $instructions = (string) $agent->instructions();

    expect($instructions)->toContain('No audits completed yet');
    expect($instructions)->not->toContain('75%');
});

it('implements HasTools with TriggerSeoAuditTool', function () {
    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
    ]);

    $agent = new Carbon(
        user: $user,
        tenant: $tenant,
    );

    expect($agent)->toBeInstanceOf(HasTools::class);

    $tools = iterator_to_array($agent->tools());
    expect($tools)->toHaveCount(1);
    expect($tools[0])->toBeInstanceOf(TriggerSeoAuditTool::class);
});

it('includes site ids in instructions for tool use', function () {
    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
        'onboarding_completed_at' => now(),
    ]);

    $site = SeoSite::factory()->create([
        'tenant_id' => $tenant->id,
        'status' => 'active',
    ]);

    $agent = new Carbon(
        user: $user,
        tenant: $tenant,
    );

    $instructions = (string) $agent->instructions();

    expect($instructions)->toContain($site->id);
    expect($instructions)->toContain('AUDIT CAPABILITIES');
    expect($instructions)->toContain('trigger_seo_audit');
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
