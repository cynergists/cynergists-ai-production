<?php

use App\Services\Cynessa\CynessaAgentHandler;
use Mockery\MockInterface;

it('returns an assistant response for a valid message', function () {
    $this->mock(CynessaAgentHandler::class, function (MockInterface $mock): void {
        $mock->shouldReceive('handle')
            ->once()
            ->withArgs(function (
                string $message,
                $user,
                $agent,
                $tenant,
                array $conversationHistory
            ): bool {
                return $message === 'Tell me about your services'
                    && $user->email === 'public-chatbot@cynergists.ai'
                    && $agent->name === 'Cynessa'
                    && $tenant->company_name === 'Public Visitor'
                    && $conversationHistory === [];
            })
            ->andReturn('Hello! I can help you with that.');
    });

    $response = $this->postJson('/api/chat', [
        'messages' => [
            ['role' => 'user', 'content' => 'Tell me about your services'],
        ],
    ]);

    $response->assertSuccessful()
        ->assertJsonStructure(['content', 'role'])
        ->assertJson([
            'role' => 'assistant',
            'content' => 'Hello! I can help you with that.',
        ]);
});

it('returns a fallback assistant response when cynessa handler fails', function () {
    $this->mock(CynessaAgentHandler::class, function (MockInterface $mock): void {
        $mock->shouldReceive('handle')
            ->once()
            ->andThrow(new RuntimeException('Service unavailable'));
    });

    $response = $this->postJson('/api/chat', [
        'messages' => [
            ['role' => 'user', 'content' => 'Hello'],
        ],
    ]);

    $response->assertSuccessful()
        ->assertJson([
            'role' => 'assistant',
            'content' => "I'm having trouble right now. Please try again in a moment.",
        ]);
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
    $this->mock(CynessaAgentHandler::class, function (MockInterface $mock): void {
        $mock->shouldReceive('handle')
            ->once()
            ->withArgs(function (
                string $message,
                $user,
                $agent,
                $tenant,
                array $conversationHistory
            ): bool {
                return $message === 'Tell me about pricing'
                    && count($conversationHistory) === 2
                    && $conversationHistory[0]['role'] === 'user'
                    && $conversationHistory[0]['content'] === 'Hi'
                    && $conversationHistory[1]['role'] === 'assistant'
                    && $conversationHistory[1]['content'] === 'Hello! How can I help?';
            })
            ->andReturn('I can help with that!');
    });

    $response = $this->postJson('/api/chat', [
        'messages' => [
            ['role' => 'user', 'content' => 'Hi'],
            ['role' => 'assistant', 'content' => 'Hello! How can I help?'],
            ['role' => 'user', 'content' => 'Tell me about pricing'],
        ],
    ]);

    $response->assertSuccessful()
        ->assertJson([
            'role' => 'assistant',
            'content' => 'I can help with that!',
        ]);
});
