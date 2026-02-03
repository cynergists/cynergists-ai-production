<?php

namespace App\Services\Cynessa;

use App\Models\PortalAvailableAgent;

class IntentParser
{
    /**
     * Parse user message to determine intent and extract entities.
     *
     * @return array{intent: string, entities: array}
     */
    public function parse(string $message, PortalAvailableAgent $agent): array
    {
        $rawMessage = trim($message);
        $message = strtolower($rawMessage);

        // Greeting patterns
        if ($this->matchesPattern($message, ['hi', 'hello', 'hey', 'good morning', 'good afternoon'])) {
            return ['intent' => 'greeting', 'entities' => []];
        }

        // Onboarding start patterns
        if ($this->matchesPattern($message, ['get started', 'onboard', 'set up', 'setup', 'begin', 'start'])) {
            return ['intent' => 'onboarding_start', 'entities' => []];
        }

        // Company information patterns
        if ($this->matchesPattern($message, ['company', 'business', 'industry', 'organization'])) {
            return [
                'intent' => 'company_info',
                'entities' => array_merge(
                    $this->extractCompanyInfo($message),
                    ['raw_message' => $rawMessage]
                ),
            ];
        }

        // Brand upload patterns
        if ($this->matchesPattern($message, ['upload', 'file', 'logo', 'brand', 'assets', 'media'])) {
            return ['intent' => 'brand_upload', 'entities' => []];
        }

        // Cynergists question patterns
        if ($this->matchesPattern($message, ['what is', 'what are', 'tell me about cynergists', 'how does', 'when'])) {
            return ['intent' => 'cynergists_question', 'entities' => []];
        }

        // Status check patterns
        if ($this->matchesPattern($message, ['status', 'progress', 'where am i', 'what\'s next', 'company info', 'my company', 'what do you know', 'whats my'])) {
            return ['intent' => 'status_check', 'entities' => []];
        }

        // Help patterns
        if ($this->matchesPattern($message, ['help', 'what can you do', 'assistance', 'support'])) {
            return ['intent' => 'help', 'entities' => []];
        }

        // Default to general conversation - treat as potential answer to onboarding question
        return [
            'intent' => 'unknown',
            'entities' => ['raw_message' => $rawMessage],
        ];
    }

    /**
     * Check if message matches any of the patterns.
     */
    private function matchesPattern(string $message, array $patterns): bool
    {
        foreach ($patterns as $pattern) {
            if (str_contains($message, $pattern)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Extract company information from message.
     */
    private function extractCompanyInfo(string $message): array
    {
        $entities = [];

        // Simple extraction - can be enhanced with NLP later
        // This is a placeholder for more sophisticated parsing
        if (preg_match('/company (?:name )?(?:is )?([a-zA-Z0-9\s&]+?)(?:\sand\s|\.|,|$)/i', $message, $matches)) {
            $entities['company_name'] = trim($matches[1]);
        }

        if (preg_match('/(?:in )?(?:the )?industry (?:is )?([a-zA-Z\s]+?)(?:\sand\s|\.|,|$)/i', $message, $matches)) {
            $entities['industry'] = trim($matches[1]);
        }
        
        // Also check for "we are in the X industry" pattern
        if (!isset($entities['industry']) && preg_match('/(?:we are in (?:the )?|in (?:the )?)([a-zA-Z\s]+?)\s+industry/i', $message, $matches)) {
            $entities['industry'] = trim($matches[1]);
        }

        return $entities;
    }
}
