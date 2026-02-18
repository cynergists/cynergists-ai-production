<?php

namespace App\Ai\Support;

use GuzzleHttp\Psr7\Utils as Psr7Utils;
use Psr\Http\Message\RequestInterface;

class AnthropicRequestPayloadLimiter
{
    public function apply(RequestInterface $request): RequestInterface
    {
        $uri = (string) $request->getUri();

        if (! str_contains($uri, 'api.anthropic.com/v1/messages')) {
            return $request;
        }

        $body = (string) $request->getBody();

        if ($body === '') {
            return $request;
        }

        $payload = json_decode($body, true);

        if (! is_array($payload)) {
            return $request;
        }

        $defaultMaxTokens = max(1, (int) config('ai.anthropic_default_max_tokens', 2048));
        $maxTokensCap = max(1, (int) config('ai.anthropic_max_tokens_cap', 4096));

        $requestedMaxTokens = $payload['max_tokens'] ?? $defaultMaxTokens;

        if (! is_int($requestedMaxTokens) || $requestedMaxTokens < 1) {
            $requestedMaxTokens = $defaultMaxTokens;
        }

        $payload['max_tokens'] = min($requestedMaxTokens, $maxTokensCap);

        $encodedPayload = json_encode($payload);

        if ($encodedPayload === false) {
            return $request;
        }

        return $request
            ->withoutHeader('Content-Length')
            ->withBody(Psr7Utils::streamFor($encodedPayload));
    }
}
