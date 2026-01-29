<?php

namespace App\Services\Apex;

use App\Models\PortalAvailableAgent;
use App\Services\ApiKeyService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class IntentParser
{
    private const INTENTS = [
        'list_campaigns' => 'User wants to see their campaigns',
        'create_campaign' => 'User wants to create a new campaign',
        'campaign_stats' => 'User wants to see campaign statistics',
        'start_campaign' => 'User wants to start/activate a campaign',
        'pause_campaign' => 'User wants to pause a campaign',
        'list_prospects' => 'User wants to see their prospects',
        'add_prospects' => 'User wants to add prospects to a campaign',
        'connect_linkedin' => 'User wants to connect their LinkedIn account',
        'linkedin_status' => 'User wants to check their LinkedIn connection status',
        'pending_actions' => 'User wants to see pending actions awaiting approval',
        'approve_actions' => 'User wants to approve pending actions',
        'deny_actions' => 'User wants to deny/reject pending actions',
        'help' => 'User needs help or wants to know what they can do',
        'general_question' => 'User is asking a general question about LinkedIn outreach',
        'unknown' => 'Intent is unclear or not related to Apex functionality',
    ];

    public function __construct(
        private ApiKeyService $apiKeyService
    ) {}

    /**
     * Parse user intent from a message.
     *
     * @return array{intent: string, entities: array, confidence: float}
     */
    public function parse(string $message, PortalAvailableAgent $agent): array
    {
        $apiKey = $this->apiKeyService->getKey($agent, 'openai');

        if (! $apiKey) {
            Log::warning("No OpenAI API key configured for agent {$agent->id}");

            return $this->fallbackParse($message);
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$apiKey}",
                'Content-Type' => 'application/json',
            ])->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-4o-mini',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => $this->getSystemPrompt(),
                    ],
                    [
                        'role' => 'user',
                        'content' => $message,
                    ],
                ],
                'response_format' => ['type' => 'json_object'],
                'temperature' => 0.1,
                'max_tokens' => 500,
            ]);

            if ($response->successful()) {
                $content = $response->json('choices.0.message.content');
                $parsed = json_decode($content, true);

                if (json_last_error() === JSON_ERROR_NONE && isset($parsed['intent'])) {
                    return [
                        'intent' => $parsed['intent'] ?? 'unknown',
                        'entities' => $parsed['entities'] ?? [],
                        'confidence' => (float) ($parsed['confidence'] ?? 0.5),
                    ];
                }
            }

            Log::warning('OpenAI intent parsing failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return $this->fallbackParse($message);
        } catch (\Exception $e) {
            Log::error('Intent parsing exception', ['error' => $e->getMessage()]);

            return $this->fallbackParse($message);
        }
    }

    /**
     * Get the system prompt for intent parsing.
     */
    private function getSystemPrompt(): string
    {
        $intentsList = collect(self::INTENTS)
            ->map(fn ($desc, $intent) => "- {$intent}: {$desc}")
            ->implode("\n");

        return <<<PROMPT
You are an intent parser for Apex, a LinkedIn outreach automation assistant. Analyze the user's message and determine their intent.

Available intents:
{$intentsList}

Extract relevant entities from the message:
- campaign_name: If the user mentions a specific campaign name
- job_titles: If the user mentions job titles to target (e.g., "CTOs", "VPs of Sales")
- locations: If the user mentions geographic locations
- count: If the user mentions a specific number
- action_type: If related to pending actions (approve/deny)

Respond with JSON in this exact format:
{
  "intent": "the_intent_name",
  "entities": {
    "campaign_name": "string or null",
    "job_titles": ["array", "of", "titles"] or null,
    "locations": ["array", "of", "locations"] or null,
    "count": number or null,
    "action_type": "approve" or "deny" or null
  },
  "confidence": 0.0 to 1.0
}
PROMPT;
    }

    /**
     * Fallback parsing using keyword matching when OpenAI is unavailable.
     */
    private function fallbackParse(string $message): array
    {
        $lowerMessage = strtolower($message);
        $intent = 'unknown';
        $entities = [];
        $confidence = 0.5;

        // Keyword-based intent detection
        if (preg_match('/\b(campaign|campaigns)\b/', $lowerMessage)) {
            if (preg_match('/\b(create|new|start|make|build)\b/', $lowerMessage)) {
                $intent = 'create_campaign';
                $confidence = 0.7;
            } elseif (preg_match('/\b(list|show|see|view|my)\b/', $lowerMessage)) {
                $intent = 'list_campaigns';
                $confidence = 0.8;
            } elseif (preg_match('/\b(stats|statistics|numbers|results|performance)\b/', $lowerMessage)) {
                $intent = 'campaign_stats';
                $confidence = 0.7;
            } elseif (preg_match('/\b(start|activate|run|launch)\b/', $lowerMessage)) {
                $intent = 'start_campaign';
                $confidence = 0.7;
            } elseif (preg_match('/\b(pause|stop|halt)\b/', $lowerMessage)) {
                $intent = 'pause_campaign';
                $confidence = 0.7;
            }
        } elseif (preg_match('/\b(prospect|prospects|lead|leads)\b/', $lowerMessage)) {
            if (preg_match('/\b(add|import|upload)\b/', $lowerMessage)) {
                $intent = 'add_prospects';
                $confidence = 0.7;
            } else {
                $intent = 'list_prospects';
                $confidence = 0.7;
            }
        } elseif (preg_match('/\b(linkedin|connect|connection)\b/', $lowerMessage)) {
            if (preg_match('/\b(status|check|connected)\b/', $lowerMessage)) {
                $intent = 'linkedin_status';
                $confidence = 0.7;
            } else {
                $intent = 'connect_linkedin';
                $confidence = 0.7;
            }
        } elseif (preg_match('/\b(pending|approve|deny|reject|action|actions)\b/', $lowerMessage)) {
            if (preg_match('/\b(approve|yes|confirm)\b/', $lowerMessage)) {
                $intent = 'approve_actions';
                $confidence = 0.7;
            } elseif (preg_match('/\b(deny|reject|no|cancel)\b/', $lowerMessage)) {
                $intent = 'deny_actions';
                $confidence = 0.7;
            } else {
                $intent = 'pending_actions';
                $confidence = 0.7;
            }
        } elseif (preg_match('/\b(help|what can you do|how|guide)\b/', $lowerMessage)) {
            $intent = 'help';
            $confidence = 0.9;
        }

        // Extract job titles
        if (preg_match_all('/\b(ceo|cto|cfo|coo|vp|director|manager|founder|owner)\b/i', $message, $matches)) {
            $entities['job_titles'] = array_unique(array_map('ucfirst', $matches[0]));
        }

        return [
            'intent' => $intent,
            'entities' => $entities,
            'confidence' => $confidence,
        ];
    }
}
