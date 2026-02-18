<?php

namespace App\Ai\Gateway;

use Laravel\Ai\Gateway\Prism\PrismGateway;
use Laravel\Ai\Gateway\TextGenerationOptions;
use Laravel\Ai\Providers\AnthropicProvider;
use Laravel\Ai\Providers\Provider;

class SafePrismGateway extends PrismGateway
{
    protected function withProviderOptions($request, Provider $provider, ?array $schema, ?TextGenerationOptions $options)
    {
        if ($provider instanceof AnthropicProvider) {
            return $request
                ->withProviderOptions(array_filter([
                    'use_tool_calling' => $schema ? true : null,
                ]))
                ->withMaxTokens($this->resolveAnthropicMaxTokens($options?->maxTokens));
        }

        return parent::withProviderOptions($request, $provider, $schema, $options);
    }

    protected function resolveAnthropicMaxTokens(?int $requestedMaxTokens): int
    {
        $defaultMaxTokens = (int) config('ai.anthropic_default_max_tokens', 2048);
        $maxTokensCap = (int) config('ai.anthropic_max_tokens_cap', 4096);

        if ($defaultMaxTokens < 1) {
            $defaultMaxTokens = 2048;
        }

        if ($maxTokensCap < 1) {
            $maxTokensCap = 4096;
        }

        $resolvedMaxTokens = $requestedMaxTokens ?? $defaultMaxTokens;

        if ($resolvedMaxTokens < 1) {
            $resolvedMaxTokens = $defaultMaxTokens;
        }

        return min($resolvedMaxTokens, $maxTokensCap);
    }
}
