<?php

namespace App\Services\Cynessa;

use App\Ai\Agents\Cynessa;
use App\Models\PortalAvailableAgent;
use App\Models\PortalTenant;
use App\Models\User;
use App\Services\SlackEscalationService;
use Illuminate\Support\Facades\Log;

class CynessaAgentHandler
{
    public function __construct(
        private OnboardingService $onboardingService,
        private SlackEscalationService $slackEscalationService
    ) {}

    /**
     * Handle an incoming chat message and generate a response.
     */
    public function handle(string $message, User $user, PortalAvailableAgent $agent, PortalTenant $tenant, array $conversationHistory = [], int $maxTokens = 1024): string
    {
        // Check if user wants to restart onboarding
        if ($this->isOnboardingRestartRequest($message)) {
            $this->onboardingService->resetOnboarding($tenant);
            $tenant->refresh();
        }

        // Check if this is a question about Cynergists - if so, include knowledge base
        $includeKnowledgeBase = $this->isQuestionAboutCynergists($message);

        try {
            // Create the Cynessa agent with all context
            $cynessaAgent = new Cynessa(
                user: $user,
                tenant: $tenant,
                conversationHistory: $conversationHistory,
                includeKnowledgeBase: $includeKnowledgeBase
            );

            // Prompt the agent and get response
            $response = $cynessaAgent->prompt(
                prompt: $message,
                model: 'claude-sonnet-4-5-20250929',
                timeout: 120
            );

            $responseText = (string) $response;

            // Extract any structured data from the response
            $this->extractAndSaveData($responseText, $tenant);

            // Handle escalation markers
            $this->handleEscalation($responseText, $tenant, $user, $conversationHistory);

            // Check if onboarding should be marked complete
            $tenant->refresh();
            $wasIncomplete = ! $this->onboardingService->isComplete($tenant);
            if ($wasIncomplete && $this->onboardingService->canComplete($tenant)) {
                $this->onboardingService->markComplete($tenant);
                $this->triggerPostOnboardingActions($tenant, $user);
            }

            // Strip internal markers from the response before showing to user
            $cleanResponse = $this->stripInternalMarkers($responseText);

            return $cleanResponse;
        } catch (\Exception $e) {
            Log::error('Laravel AI error in Cynessa: '.$e->getMessage(), [
                'exception' => $e,
                'user_id' => $user->id,
                'tenant_id' => $tenant->id,
            ]);

            return "I'm having trouble connecting right now. Please try again in a moment or contact support if this continues.";
        }
    }

    /**
     * Check if message is asking a question about Cynergists.
     */
    private function isQuestionAboutCynergists(string $message): bool
    {
        $keywords = [
            'what is cynergists',
            'cynergists',
            'how does',
            'how much',
            'pricing',
            'cost',
            'billing',
            'cancel',
            'refund',
            'agent',
            'agents',
            'marketplace',
            'what do you',
            'tell me about',
            'explain',
            'support',
            'help',
            'custom',
            'integration',
        ];

        $lowerMessage = strtolower($message);

        foreach ($keywords as $keyword) {
            if (strpos($lowerMessage, $keyword) !== false) {
                return true;
            }
        }

        return false;
    }

    /**
     * Extract structured data from Claude's response and save it.
     */
    private function extractAndSaveData(string $response, PortalTenant $tenant): void
    {
        if (preg_match('/\[DATA: (.*?)\]/', $response, $matches)) {
            $dataString = $matches[1];

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

            if (preg_match('/brand_tone="([^"]+)"/', $dataString, $match)) {
                $updates['brand_tone'] = trim($match[1]);
            }

            if (preg_match('/website="([^"]+)"/', $dataString, $match)) {
                $updates['website'] = trim($match[1]);
            }

            if (preg_match('/business_description="([^"]+)"/', $dataString, $match)) {
                $updates['business_description'] = trim($match[1]);
            }

            if (preg_match('/brand_colors="([^"]+)"/', $dataString, $match)) {
                $updates['brand_colors'] = trim($match[1]);
            }

            // Check for file type updates
            if (preg_match('/file_type="([^"]+):([^"]+)"/', $dataString, $match)) {
                $filename = trim($match[1]);
                $fileType = trim($match[2]);
                $this->onboardingService->updateBrandAssetType($tenant, $filename, $fileType);
            }

            if (! empty($updates)) {
                $this->onboardingService->updateCompanyInfo($tenant, $updates);
            }
        }
    }

    /**
     * Handle escalation markers in the response.
     */
    private function handleEscalation(string $response, PortalTenant $tenant, User $user, array $conversationHistory): void
    {
        if (preg_match('/\[ESCALATE: ([^\]]+)\]/', $response, $matches)) {
            $reason = trim($matches[1]);

            $this->slackEscalationService->escalate($tenant, $user, $reason, [
                'conversation_excerpt' => array_slice($conversationHistory, -4),
                'google_drive_folder_id' => ($tenant->settings ?? [])['google_drive_folder_id'] ?? null,
                'ghl_contact_id' => ($tenant->settings ?? [])['ghl_contact_id'] ?? null,
            ]);
        }
    }

    /**
     * Trigger post-onboarding actions (Google Drive folder, CRM sync).
     */
    private function triggerPostOnboardingActions(PortalTenant $tenant, User $user): void
    {
        try {
            $this->onboardingService->createDriveFolder($tenant);
        } catch (\Exception $e) {
            Log::warning('Post-onboarding Google Drive folder creation failed', [
                'tenant_id' => $tenant->id,
                'error' => $e->getMessage(),
            ]);
        }

        try {
            $this->onboardingService->syncToCRM($tenant, $user);
        } catch (\Exception $e) {
            Log::warning('Post-onboarding CRM sync failed', [
                'tenant_id' => $tenant->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Remove [DATA: ...] and [ESCALATE: ...] markers from the response.
     */
    private function stripInternalMarkers(string $response): string
    {
        // Remove all [DATA: ...] markers
        $cleaned = preg_replace('/\[DATA:.*?\]/s', '', $response);

        // Remove all [ESCALATE: ...] markers
        $cleaned = preg_replace('/\[ESCALATE:.*?\]/s', '', $cleaned);

        // Clean up multiple blank lines
        $cleaned = preg_replace('/\n{3,}/', "\n\n", $cleaned);

        return trim($cleaned);
    }

    /**
     * Check if the message is a request to restart onboarding.
     */
    private function isOnboardingRestartRequest(string $message): bool
    {
        $keywords = [
            'start onboarding',
            'start on boarding',
            'restart onboarding',
            'restart on boarding',
            're-start onboarding',
            'begin onboarding',
            'begin on boarding',
            'redo onboarding',
            'redo on boarding',
            'onboard me',
            'onboard again',
            'start over',
            'restart setup',
            'restart the onboarding',
            'reset onboarding',
            'reset on boarding',
        ];

        $lowerMessage = strtolower($message);

        foreach ($keywords as $keyword) {
            if (strpos($lowerMessage, $keyword) !== false) {
                return true;
            }
        }

        return false;
    }
}
