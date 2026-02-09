<?php

use App\Models\AgentAccess;
use App\Models\CustomerSubscription;
use App\Models\PortalAvailableAgent;
use App\Models\PortalTenant;
use App\Models\User;
use App\Services\Apex\ApexAgentHandler;
use App\Services\Carbon\CarbonAgentHandler;
use App\Services\Cynessa\CynessaAgentHandler;
use App\Services\EventEmailService;
use App\Services\Luna\LunaAgentHandler;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->tenant = PortalTenant::factory()->create(['user_id' => $this->user->id]);
    $this->subscription = CustomerSubscription::factory()->create(['tenant_id' => $this->tenant->id]);

    $this->mock(EventEmailService::class)->shouldIgnoreMissing();
});

function createAgentWithAccess(string $agentName, object $context): AgentAccess
{
    $available = PortalAvailableAgent::factory()->create([
        'name' => $agentName,
        'price' => 49.00,
    ]);

    return AgentAccess::factory()->create([
        'tenant_id' => $context->tenant->id,
        'subscription_id' => $context->subscription->id,
        'agent_name' => $agentName,
        'is_active' => true,
    ]);
}

it('processes voice message for carbon agent', function () {
    $agent = createAgentWithAccess('Carbon', $this);

    $this->mock(CarbonAgentHandler::class)
        ->shouldReceive('handle')
        ->once()
        ->andReturn('Your SEO looks great!');

    $response = $this->actingAs($this->user)
        ->postJson("/api/portal/voice/{$agent->id}", [
            'message' => 'How is my SEO doing?',
        ]);

    $response->assertSuccessful()
        ->assertJsonPath('success', true)
        ->assertJsonPath('text', 'Your SEO looks great!');
});

it('processes voice message for cynessa agent', function () {
    $agent = createAgentWithAccess('Cynessa', $this);

    $this->mock(CynessaAgentHandler::class)
        ->shouldReceive('handle')
        ->once()
        ->andReturn('Hello! How can I help?');

    $response = $this->actingAs($this->user)
        ->postJson("/api/portal/voice/{$agent->id}", [
            'message' => 'Hello',
        ]);

    $response->assertSuccessful()
        ->assertJsonPath('success', true)
        ->assertJsonPath('text', 'Hello! How can I help?');
});

it('processes voice message for luna agent', function () {
    $agent = createAgentWithAccess('Luna', $this);

    $this->mock(LunaAgentHandler::class)
        ->shouldReceive('handle')
        ->once()
        ->andReturn('Here is your social media report.');

    $response = $this->actingAs($this->user)
        ->postJson("/api/portal/voice/{$agent->id}", [
            'message' => 'Show me my social media stats',
        ]);

    $response->assertSuccessful()
        ->assertJsonPath('success', true)
        ->assertJsonPath('text', 'Here is your social media report.');
});

it('processes voice message for apex agent', function () {
    $agent = createAgentWithAccess('Apex', $this);

    $this->mock(ApexAgentHandler::class)
        ->shouldReceive('handle')
        ->once()
        ->andReturn('Your campaign is performing well!');

    $response = $this->actingAs($this->user)
        ->postJson("/api/portal/voice/{$agent->id}", [
            'message' => 'How are my campaigns doing?',
        ]);

    $response->assertSuccessful()
        ->assertJsonPath('success', true)
        ->assertJsonPath('text', 'Your campaign is performing well!');
});

it('requires authentication for voice endpoint', function () {
    $response = $this->postJson('/api/portal/voice/some-agent-id', [
        'message' => 'Hello',
    ]);

    $response->assertUnauthorized();
});

it('validates message is required', function () {
    $response = $this->actingAs($this->user)
        ->postJson('/api/portal/voice/some-agent-id', []);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors('message');
});
