<?php

use App\Models\PortalAvailableAgent;
use App\Models\SupportRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// Happy paths

it('submits a general support request successfully', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/api/portal/support', [
        'category' => 'general',
        'subject' => 'How do I get started?',
        'message' => 'I need help getting started with the platform.',
    ]);

    $response->assertSuccessful();
    expect($response->json('success'))->toBeTrue();

    $this->assertDatabaseHas('support_requests', [
        'user_id' => $user->id,
        'category' => 'general',
        'agent_name' => null,
        'subject' => 'How do I get started?',
        'status' => 'open',
    ]);
});

it('submits an agent_issue support request with agent_name', function () {
    $user = User::factory()->create();
    PortalAvailableAgent::factory()->create(['name' => 'Apex', 'is_active' => true]);

    $response = $this->actingAs($user)->postJson('/api/portal/support', [
        'category' => 'agent_issue',
        'agent_name' => 'Apex',
        'subject' => 'Apex is not responding',
        'message' => 'When I send a message to Apex, it does not respond.',
    ]);

    $response->assertSuccessful();
    expect($response->json('success'))->toBeTrue();

    $this->assertDatabaseHas('support_requests', [
        'user_id' => $user->id,
        'category' => 'agent_issue',
        'agent_name' => 'Apex',
        'subject' => 'Apex is not responding',
    ]);
});

it('submits a portal_issue support request', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/api/portal/support', [
        'category' => 'portal_issue',
        'subject' => 'Page not loading',
        'message' => 'The billing page is not loading correctly.',
    ]);

    $response->assertSuccessful();

    $this->assertDatabaseHas('support_requests', [
        'user_id' => $user->id,
        'category' => 'portal_issue',
        'agent_name' => null,
    ]);
});

it('accepts all valid category values', function (string $category) {
    $user = User::factory()->create();

    if ($category === 'agent_issue') {
        PortalAvailableAgent::factory()->create(['name' => 'Cynessa', 'is_active' => true]);
    }

    $response = $this->actingAs($user)->postJson('/api/portal/support', [
        'category' => $category,
        'agent_name' => $category === 'agent_issue' ? 'Cynessa' : null,
        'subject' => 'Test subject',
        'message' => 'Test message content.',
    ]);

    $response->assertSuccessful();
})->with(['agent_issue', 'billing', 'feature_request', 'general', 'portal_issue', 'other']);

// Agent names endpoint

it('returns agent names for support form', function () {
    $user = User::factory()->create();
    PortalAvailableAgent::factory()->create(['name' => 'Apex', 'is_active' => true]);
    PortalAvailableAgent::factory()->create(['name' => 'Cynessa', 'is_active' => true]);
    PortalAvailableAgent::factory()->create(['name' => 'Carbon', 'is_active' => true]);

    $response = $this->actingAs($user)->getJson('/api/portal/support/agent-names');

    $response->assertSuccessful();
    expect($response->json('agents'))->toHaveCount(3);
});

it('returns only active agents in agent names', function () {
    $user = User::factory()->create();
    PortalAvailableAgent::factory()->create(['name' => 'Apex', 'is_active' => true]);
    PortalAvailableAgent::factory()->create(['name' => 'Inactive Agent', 'is_active' => false]);

    $response = $this->actingAs($user)->getJson('/api/portal/support/agent-names');

    $response->assertSuccessful();
    expect($response->json('agents'))->toHaveCount(1)
        ->and($response->json('agents.0'))->toBe('Apex');
});

it('returns agent names sorted alphabetically', function () {
    $user = User::factory()->create();
    PortalAvailableAgent::factory()->create(['name' => 'Carbon', 'is_active' => true]);
    PortalAvailableAgent::factory()->create(['name' => 'Apex', 'is_active' => true]);
    PortalAvailableAgent::factory()->create(['name' => 'Beacon', 'is_active' => true]);

    $response = $this->actingAs($user)->getJson('/api/portal/support/agent-names');

    $response->assertSuccessful();
    expect($response->json('agents'))->toBe(['Apex', 'Beacon', 'Carbon']);
});

// Validation failures

it('requires category field', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/api/portal/support', [
        'subject' => 'Test',
        'message' => 'Test message.',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors('category');
});

it('rejects invalid category values', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/api/portal/support', [
        'category' => 'invalid_category',
        'subject' => 'Test',
        'message' => 'Test message.',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors('category');
});

it('requires agent_name when category is agent_issue', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/api/portal/support', [
        'category' => 'agent_issue',
        'subject' => 'Agent problem',
        'message' => 'The agent is not working.',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors('agent_name');
});

it('rejects non-existent agent_name', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/api/portal/support', [
        'category' => 'agent_issue',
        'agent_name' => 'NonExistentAgent',
        'subject' => 'Agent problem',
        'message' => 'The agent is not working.',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors('agent_name');
});

it('does not require agent_name for non-agent_issue categories', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/api/portal/support', [
        'category' => 'billing',
        'subject' => 'Billing question',
        'message' => 'I have a billing question.',
    ]);

    $response->assertSuccessful();
});

it('requires subject field', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/api/portal/support', [
        'category' => 'general',
        'message' => 'Test message.',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors('subject');
});

it('requires message field', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/api/portal/support', [
        'category' => 'general',
        'subject' => 'Test',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors('message');
});

it('enforces subject max length', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/api/portal/support', [
        'category' => 'general',
        'subject' => str_repeat('a', 201),
        'message' => 'Test message.',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors('subject');
});

// Auth

it('requires authentication to submit support request', function () {
    $response = $this->postJson('/api/portal/support', [
        'category' => 'general',
        'subject' => 'Test',
        'message' => 'Test message.',
    ]);

    $response->assertUnauthorized();
});

it('requires authentication to fetch agent names', function () {
    $response = $this->getJson('/api/portal/support/agent-names');

    $response->assertUnauthorized();
});

// Factory

it('creates support request using factory', function () {
    $supportRequest = SupportRequest::factory()->create();

    expect($supportRequest)->toBeInstanceOf(SupportRequest::class)
        ->and($supportRequest->status)->toBe('open')
        ->and($supportRequest->user)->not->toBeNull();
});

it('creates support request with agent using factory', function () {
    $supportRequest = SupportRequest::factory()->withAgent('Apex')->create();

    expect($supportRequest->category)->toBe('agent_issue')
        ->and($supportRequest->agent_name)->toBe('Apex');
});
