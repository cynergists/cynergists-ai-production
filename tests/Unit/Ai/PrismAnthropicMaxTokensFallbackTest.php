<?php

use Prism\Prism\Enums\StructuredMode;
use Prism\Prism\Providers\Anthropic\Handlers\Structured as AnthropicStructuredHandler;
use Prism\Prism\Providers\Anthropic\Handlers\Text as AnthropicTextHandler;
use Prism\Prism\Schema\ObjectSchema;
use Prism\Prism\Structured\Request as StructuredRequest;
use Prism\Prism\Text\Request as TextRequest;
use Tests\TestCase;

uses(TestCase::class);

it('uses configured default max tokens for anthropic text payloads', function () {
    config()->set('prism.providers.anthropic.default_max_tokens', 1800);
    config()->set('prism.providers.anthropic.max_tokens_cap', 4096);

    $request = new TextRequest(
        model: 'claude-sonnet-4-5-20250929',
        providerKey: 'anthropic',
        systemPrompts: [],
        prompt: null,
        messages: [],
        maxSteps: 1,
        maxTokens: null,
        temperature: null,
        topP: null,
        tools: [],
        clientOptions: [],
        clientRetry: [1],
        toolChoice: null,
        providerOptions: [],
        providerTools: [],
    );

    $payload = AnthropicTextHandler::buildHttpRequestPayload($request);

    expect($payload['max_tokens'])->toBe(1800);
});

it('caps anthropic text payload max tokens to configured cap', function () {
    config()->set('prism.providers.anthropic.default_max_tokens', 2048);
    config()->set('prism.providers.anthropic.max_tokens_cap', 4096);

    $request = new TextRequest(
        model: 'claude-sonnet-4-5-20250929',
        providerKey: 'anthropic',
        systemPrompts: [],
        prompt: null,
        messages: [],
        maxSteps: 1,
        maxTokens: 64000,
        temperature: null,
        topP: null,
        tools: [],
        clientOptions: [],
        clientRetry: [1],
        toolChoice: null,
        providerOptions: [],
        providerTools: [],
    );

    $payload = AnthropicTextHandler::buildHttpRequestPayload($request);

    expect($payload['max_tokens'])->toBe(4096);
});

it('uses configured default max tokens for anthropic structured payloads', function () {
    config()->set('prism.providers.anthropic.default_max_tokens', 1700);
    config()->set('prism.providers.anthropic.max_tokens_cap', 4096);

    $request = new StructuredRequest(
        systemPrompts: [],
        model: 'claude-sonnet-4-5-20250929',
        providerKey: 'anthropic',
        prompt: null,
        messages: [],
        maxTokens: null,
        temperature: null,
        topP: null,
        clientOptions: [],
        clientRetry: [1],
        schema: new ObjectSchema('result', 'Test schema', []),
        mode: StructuredMode::Auto,
        tools: [],
        toolChoice: null,
        maxSteps: 1,
        providerOptions: [],
        providerTools: [],
    );

    $payload = AnthropicStructuredHandler::buildHttpRequestPayload($request);

    expect($payload['max_tokens'])->toBe(1700);
});
