<?php

use App\Models\AgentAccess;
use App\Models\AgentConversation;
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
use Illuminate\Support\Str;

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

it('validates message is required when not initiating', function () {
    $response = $this->actingAs($this->user)
        ->postJson('/api/portal/voice/some-agent-id', []);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors('message');
});

it('initiates voice conversation with agent greeting', function () {
    $agent = createAgentWithAccess('Apex', $this);

    $this->mock(ApexAgentHandler::class)
        ->shouldReceive('handle')
        ->once()
        ->andReturn("Hey, I'm Apex. Ready to help with your LinkedIn outreach.");

    $response = $this->actingAs($this->user)
        ->postJson("/api/portal/voice/{$agent->id}", [
            'initiate' => true,
        ]);

    $response->assertSuccessful()
        ->assertJsonPath('success', true)
        ->assertJsonPath('text', "Hey, I'm Apex. Ready to help with your LinkedIn outreach.");
});

it('does not require message when initiating voice conversation', function () {
    $agent = createAgentWithAccess('Cynessa', $this);

    $this->mock(CynessaAgentHandler::class)
        ->shouldReceive('handle')
        ->once()
        ->andReturn('Hi there! I\'m Cynessa.');

    $response = $this->actingAs($this->user)
        ->postJson("/api/portal/voice/{$agent->id}", [
            'initiate' => true,
        ]);

    $response->assertSuccessful()
        ->assertJsonPath('success', true);
});

it('bounds voice conversation history before invoking the agent handler', function () {
    $agent = createAgentWithAccess('Apex', $this);

    $messages = [];

    for ($i = 0; $i < 45; $i++) {
        $messages[] = [
            'role' => $i % 2 === 0 ? 'user' : 'assistant',
            'content' => "history-{$i} ".str_repeat('x', 1200),
        ];
    }

    AgentConversation::query()->create([
        'id' => (string) Str::uuid(),
        'agent_access_id' => $agent->id,
        'customer_id' => (string) $this->tenant->id,
        'title' => 'Voice Conversation',
        'messages' => $messages,
        'status' => 'active',
        'tenant_id' => $this->tenant->id,
    ]);

    $this->mock(ApexAgentHandler::class)
        ->shouldReceive('handle')
        ->once()
        ->withArgs(function (
            string $message,
            User $user,
            PortalAvailableAgent $availableAgent,
            PortalTenant $tenant,
            array $conversationHistory,
            int $maxTokens
        ) {
            $totalCharacters = array_sum(array_map(
                fn (array $entry): int => strlen($entry['content']),
                $conversationHistory
            ));

            return $maxTokens === 128
                && count($conversationHistory) <= 24
                && $totalCharacters <= 24000
                && str_contains($conversationHistory[array_key_last($conversationHistory)]['content'], 'history-44');
        })
        ->andReturn('Bounded voice response');

    $response = $this->actingAs($this->user)
        ->postJson("/api/portal/voice/{$agent->id}", [
            'message' => 'How are my campaigns doing?',
        ]);

    $response->assertSuccessful()
        ->assertJsonPath('text', 'Bounded voice response');
});
