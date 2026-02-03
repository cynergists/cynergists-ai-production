<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class ClaudeService
{
    private string $apiKey;
    private string $model = 'claude-3-haiku-20240307';

    public function __construct()
    {
        $this->apiKey = config('services.anthropic.api_key');
    }

    /**
     * Send a message to Claude and get a response.
     *
     * @param array $messages Array of message objects with 'role' and 'content'
     * @param string|null $systemPrompt System prompt to guide Claude's behavior
     * @param int $maxTokens Maximum tokens in response
     * @return string The assistant's response
     */
    public function chat(array $messages, ?string $systemPrompt = null, int $maxTokens = 2048): string
    {
        $payload = [
            'model' => $this->model,
            'max_tokens' => $maxTokens,
            'messages' => $messages,
        ];

        if ($systemPrompt) {
            $payload['system'] = $systemPrompt;
        }

        $response = Http::withHeaders([
            'x-api-key' => $this->apiKey,
            'anthropic-version' => '2023-06-01',
            'content-type' => 'application/json',
        ])->post('https://api.anthropic.com/v1/messages', $payload);

        if ($response->failed()) {
            throw new \Exception('Claude API request failed: ' . $response->body());
        }

        $data = $response->json();

        // Extract text from the first content block
        return $data['content'][0]['text'] ?? '';
    }

    /**
     * Simple single-message chat (convenience method).
     */
    public function ask(string $message, ?string $systemPrompt = null, int $maxTokens = 2048): string
    {
        return $this->chat([
            ['role' => 'user', 'content' => $message],
        ], $systemPrompt, $maxTokens);
    }
}
