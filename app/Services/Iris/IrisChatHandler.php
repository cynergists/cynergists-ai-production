<?php

namespace App\Services\Iris;

use App\Ai\Agents\Cynessa;
use App\Models\PortalAvailableAgent;
use App\Models\PortalTenant;
use App\Models\User;
use App\Services\Cynessa\OnboardingService;
use App\Services\Portal\AgentOnboardingService;
use App\Services\SlackEscalationService;
use Illuminate\Support\Facades\Log;

class IrisChatHandler
{
    public function __construct(
        private OnboardingService $onboardingService,
        private AgentOnboardingService $agentOnboardingService,
        private SlackEscalationService $slackEscalationService
    ) {}

    /**
     * Handle an incoming Iris chat message and generate a response.
     *
     * Iris guides users through brand kit / company setup onboarding.
     * Delegates to the Cynessa AI agent which already has the onboarding system prompt.
     */
    public function handle(string $message, User $user, PortalAvailableAgent $agent, PortalTenant $tenant, array $conversationHistory = [], int $maxTokens = 1024): string
    {
        // Check if user wants to restart onboarding
        if ($this->isOnboardingRestartRequest($message)) {
            $this->onboardingService->resetOnboarding($tenant);
            $this->agentOnboardingService->reset($tenant, 'iris', $user);
            $tenant->refresh();
        }

        try {
            // Iris uses the same Cynessa AI agent — both guide through onboarding
            $irisAgent = new Cynessa(
                user: $user,
                tenant: $tenant,
                conversationHistory: $conversationHistory,
                includeKnowledgeBase: true
            );

            $response = $irisAgent->prompt(
                prompt: $message,
                model: 'claude-sonnet-4-6',
                timeout: 120
            );

            $responseText = (string) $response;

            // Extract and save structured data from the response
            $this->extractAndSaveData($responseText, $tenant);

            // Handle escalation markers
            $this->handleEscalation($responseText, $tenant, $user, $conversationHistory);

            // Mark Iris onboarding as started if not already
            $currentState = $this->agentOnboardingService->getOrCreateState($tenant, 'iris');
            if ($currentState->state === 'not_started') {
                $this->agentOnboardingService->markStarted($tenant, 'iris', $user);
            }

            // Check if onboarding should be marked complete
            $tenant->refresh();
            $wasIncomplete = ! $this->onboardingService->isComplete($tenant);
            if ($wasIncomplete && $this->onboardingService->canComplete($tenant)) {
                $this->onboardingService->markComplete($tenant, $user);
                $this->triggerPostOnboardingActions($tenant, $user);
            }

            return $this->stripInternalMarkers($responseText);
        } catch (\Exception $e) {
            Log::error('Iris agent error: '.$e->getMessage(), [
                'exception' => $e,
                'user_id' => $user->id,
                'tenant_id' => $tenant->id,
            ]);

            return "I'm having trouble connecting right now. Please try again in a moment or contact support if this continues.";
        }
    }

    /**
     * Extract structured data from the AI response and save it.
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

            if (preg_match('/file_type="([^"]+):([^"]+)"/', $dataString, $match)) {
                $this->onboardingService->updateBrandAssetType($tenant, trim($match[1]), trim($match[2]));
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
            $this->slackEscalationService->escalate($tenant, $user, trim($matches[1]), [
                'conversation_excerpt' => array_slice($conversationHistory, -4),
                'google_drive_folder_id' => ($tenant->settings ?? [])['google_drive_folder_id'] ?? null,
                'ghl_contact_id' => ($tenant->settings ?? [])['ghl_contact_id'] ?? null,
            ]);
        }
    }

    /**
     * Trigger post-onboarding actions.
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
     * Strip internal markers from the AI response.
     */
    private function stripInternalMarkers(string $response): string
    {
        $cleaned = preg_replace('/\[DATA:.*?\]/s', '', $response);
        $cleaned = preg_replace('/\[ESCALATE:.*?\]/s', '', $cleaned);
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
            'restart onboarding',
            'begin onboarding',
            'redo onboarding',
            'start over',
            'restart setup',
            'reset onboarding',
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
