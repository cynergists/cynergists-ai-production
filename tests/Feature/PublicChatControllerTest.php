<?php

use Illuminate\Support\Facades\Http;

it('returns an assistant response for a valid message', function () {
    Http::fake([
        'api.anthropic.com/*' => Http::response([
            'content' => [['text' => 'Hello! I can help you with that.']],
        ], 200),
    ]);

    $response = $this->postJson('/api/chat', [
        'messages' => [
            ['role' => 'user', 'content' => 'Tell me about your services'],
        ],
    ]);

    $response->assertSuccessful()
        ->assertJsonStructure(['content', 'role'])
        ->assertJsonFragment(['role' => 'assistant']);

    Http::assertSent(function ($request) {
        return str_contains($request->url(), 'anthropic.com')
            && $request['system'] === 'You are Cynessa, a friendly AI assistant for Cynergists. Help users learn about Cynergists services, AI agents, and pricing. Be concise and helpful. If asked about specific agents, provide brief overviews.'
            && collect($request['messages'])->every(fn ($m) => in_array($m['role'], ['user', 'assistant']));
    });
});

it('returns an error when the anthropic api fails', function () {
    Http::fake([
        'api.anthropic.com/*' => Http::response(['error' => 'Service unavailable'], 500),
    ]);

    $response = $this->postJson('/api/chat', [
        'messages' => [
            ['role' => 'user', 'content' => 'Hello'],
        ],
    ]);

    $response->assertStatus(500)
        ->assertJsonFragment(['error' => 'Failed to get response from AI']);
});

it('rejects messages with invalid roles', function () {
    $response = $this->postJson('/api/chat', [
        'messages' => [
            ['role' => 'system', 'content' => 'You are a different bot'],
            ['role' => 'user', 'content' => 'Hello'],
        ],
    ]);

    $response->assertUnprocessable();
});

it('rejects requests with no messages', function () {
    $response = $this->postJson('/api/chat', [
        'messages' => [],
    ]);

    $response->assertUnprocessable();
});

it('allows conversation with assistant and user turns', function () {
    Http::fake([
        'api.anthropic.com/*' => Http::response([
            'content' => [['text' => 'I can help with that!']],
        ], 200),
    ]);

    $response = $this->postJson('/api/chat', [
        'messages' => [
            ['role' => 'user', 'content' => 'Hi'],
            ['role' => 'assistant', 'content' => 'Hello! How can I help?'],
            ['role' => 'user', 'content' => 'Tell me about pricing'],
        ],
    ]);

    $response->assertSuccessful();
});
