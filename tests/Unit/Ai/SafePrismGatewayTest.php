<?php

use App\Ai\Gateway\SafePrismGateway;
use Illuminate\Contracts\Events\Dispatcher;
use Tests\TestCase;

uses(TestCase::class);

class TestableSafePrismGateway extends SafePrismGateway
{
    public function resolveMaxTokens(?int $requestedMaxTokens): int
    {
        return $this->resolveAnthropicMaxTokens($requestedMaxTokens);
    }
}

it('uses configured anthropic default max tokens when not provided', function () {
    config()->set('ai.anthropic_default_max_tokens', 1800);
    config()->set('ai.anthropic_max_tokens_cap', 4096);

    $gateway = new TestableSafePrismGateway(app(Dispatcher::class));

    expect($gateway->resolveMaxTokens(null))->toBe(1800);
});

it('caps anthropic max tokens when requested value is too high', function () {
    config()->set('ai.anthropic_default_max_tokens', 2048);
    config()->set('ai.anthropic_max_tokens_cap', 4096);

    $gateway = new TestableSafePrismGateway(app(Dispatcher::class));

    expect($gateway->resolveMaxTokens(64000))->toBe(4096);
});

it('keeps explicit anthropic max tokens when within cap', function () {
    config()->set('ai.anthropic_default_max_tokens', 2048);
    config()->set('ai.anthropic_max_tokens_cap', 4096);

    $gateway = new TestableSafePrismGateway(app(Dispatcher::class));

    expect($gateway->resolveMaxTokens(1024))->toBe(1024);
});
