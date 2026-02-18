<?php

use App\Ai\Support\AnthropicRequestPayloadLimiter;
use GuzzleHttp\Psr7\Request;
use Tests\TestCase;

uses(TestCase::class);

it('clamps max tokens for anthropic messages requests', function () {
    config()->set('ai.anthropic_default_max_tokens', 2048);
    config()->set('ai.anthropic_max_tokens_cap', 4096);

    $request = new Request(
        method: 'POST',
        uri: 'https://api.anthropic.com/v1/messages',
        headers: ['Content-Type' => 'application/json'],
        body: json_encode([
            'model' => 'claude-sonnet-4-5-20250929',
            'max_tokens' => 64000,
            'messages' => [
                ['role' => 'user', 'content' => 'hello'],
            ],
        ])
    );

    $limitedRequest = (new AnthropicRequestPayloadLimiter)->apply($request);
    $payload = json_decode((string) $limitedRequest->getBody(), true);

    expect($payload['max_tokens'])->toBe(4096);
});

it('does not modify non anthropic requests', function () {
    $request = new Request(
        method: 'POST',
        uri: 'https://api.example.com/messages',
        headers: ['Content-Type' => 'application/json'],
        body: json_encode([
            'max_tokens' => 64000,
        ])
    );

    $limitedRequest = (new AnthropicRequestPayloadLimiter)->apply($request);
    $payload = json_decode((string) $limitedRequest->getBody(), true);

    expect($payload['max_tokens'])->toBe(64000);
});
