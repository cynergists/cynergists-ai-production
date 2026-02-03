<?php

namespace App\Services\Cynessa;

use App\Models\PortalAvailableAgent;
use App\Models\PortalTenant;
use App\Models\User;
use App\Services\ClaudeService;

class CynessaAgentHandler
{
    public function __construct(
        private ClaudeService $claudeService,
        private OnboardingService $onboardingService
    ) {}

    /**
     * Handle an incoming chat message and generate a response.
     */
    public function handle(string $message, User $user, PortalAvailableAgent $agent, PortalTenant $tenant): string
    {
        // Build context about the user and their current onboarding state
        $settings = $tenant->settings ?? [];
        
        $systemPrompt = $this->buildSystemPrompt($user, $tenant, $settings);
        $userContext = $this->buildUserContext($tenant, $settings);
        
        // Call Claude with conversation context
        $fullMessage = $userContext . "\n\nUser message: " . $message;
        
        try {
            $response = $this->claudeService->ask($fullMessage, $systemPrompt, 1024);
            
            // Extract any structured data from the response
            $this->extractAndSaveData($response, $tenant);
            
            return $response;
        } catch (\Exception $e) {
            \Log::error('Claude API error in Cynessa: ' . $e->getMessage());
            return "I'm having trouble connecting right now. Please try again in a moment or contact support if this continues.";
        }
    }

    /**
     * Build the system prompt for Claude.
     */
    private function buildSystemPrompt(User $user, PortalTenant $tenant, array $settings): string
    {
        $firstName = explode(' ', $user->name)[0] ?? $user->name;
        
        return "You are Cynessa, an AI onboarding assistant for Cynergists. You help new customers get set up by collecting key information.

Your personality: Friendly, professional, helpful, concise. Use emojis sparingly but appropriately.

Your primary job is to collect this information step-by-step:
1. Company name
2. Industry
3. What services they need from Cynergists

IMPORTANT INSTRUCTIONS:
- Ask for ONE piece of information at a time
- When the user provides information, acknowledge it and ask for the next piece
- Be conversational and natural - don't use rigid scripts
- If information is missing or unclear, politely ask again
- When all basic info is collected, offer to help with brand asset uploads
- The user's first name is: {$firstName}
- You can check their current progress below

RESPONSE FORMAT:
When you receive information, respond naturally and include a special marker line at the end:
[DATA: company_name=\"Their Company\" industry=\"their industry\" services=\"what they said\"]

Only include fields that were just provided or updated in the user's message.";
    }

    /**
     * Build context about the user's current state.
     */
    private function buildUserContext(PortalTenant $tenant, array $settings): string
    {
        $context = "CURRENT USER DATA:\n";
        
        if ($tenant->company_name) {
            $context .= "✅ Company Name: {$tenant->company_name}\n";
        } else {
            $context .= "❌ Company Name: NOT SET - This should be your next question\n";
        }
        
        if (!empty($settings['industry'])) {
            $context .= "✅ Industry: {$settings['industry']}\n";
        } else {
            if ($tenant->company_name) {
                $context .= "❌ Industry: NOT SET - This should be your next question\n";
            } else {
                $context .= "❌ Industry: NOT SET - Ask after company name\n";
            }
        }
        
        if (!empty($settings['services_needed'])) {
            $context .= "✅ Services Needed: {$settings['services_needed']}\n";
        } else {
            if ($tenant->company_name && !empty($settings['industry'])) {
                $context .= "❌ Services Needed: NOT SET - This should be your next question\n";
            } else {
                $context .= "❌ Services Needed: NOT SET - Ask after industry\n";
            }
        }
        
        return $context;
    }

    /**
     * Extract structured data from Claude's response and save it.
     */
    private function extractAndSaveData(string $response, PortalTenant $tenant): void
    {
        // Look for [DATA: ...] marker
        if (preg_match('/\[DATA: (.*?)\]/', $response, $matches)) {
            $dataString = $matches[1];
            
            // Parse the data string
            $updates = [];
            
            if (preg_match('/company_name="([^"]+)"/', $dataString, $match)) {
                $updates['company_name'] = trim($match[1]);
            }
            
            if (preg_match('/industry="([^"]+)"/', $dataString, $match)) {
                $updates['industry'] = trim($match[1]);
            }
            
            if (preg_match('/services="([^"]+)"/', $dataString, $match)) {
                $updates['services_needed'] = trim($match[1]);
            }
            
            // Save if we have updates
            if (!empty($updates)) {
                $this->onboardingService->updateCompanyInfo($tenant, $updates);
            }
        }
    }
}


