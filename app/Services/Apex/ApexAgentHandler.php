<?php

namespace App\Services\Apex;

use App\Ai\Agents\Apex;
use App\Models\ApexUserSettings;
use App\Models\PortalAvailableAgent;
use App\Models\PortalTenant;
use App\Models\User;
use App\Services\SlackEscalationService;
use Illuminate\Support\Facades\Log;

class ApexAgentHandler
{
    public function __construct(
        private SlackEscalationService $slackEscalationService
    ) {}

    /**
     * Handle an incoming chat message and generate a response.
     */
    public function handle(string $message, User $user, PortalAvailableAgent $agent, PortalTenant $tenant, array $conversationHistory = [], int $maxTokens = 1024): string
    {
        try {
            $apexAgent = new Apex(
                user: $user,
                tenant: $tenant,
                conversationHistory: $conversationHistory
            );

            $response = $apexAgent->prompt(
                prompt: $message,
                model: 'claude-sonnet-4-5-20250929',
                timeout: 120
            );

            $responseText = (string) $response;

            // Extract any structured campaign data from the response
            $this->extractAndSaveCampaignData($responseText, $user);

            // Handle escalation markers
            $this->handleEscalation($responseText, $tenant, $user, $conversationHistory);

            // Strip internal markers before returning to user
            return $this->stripInternalMarkers($responseText);

        } catch (\Exception $e) {
            Log::error('Laravel AI error in Apex: '.$e->getMessage(), [
                'exception' => $e,
                'user_id' => $user->id,
                'tenant_id' => $tenant->id,
            ]);

            return "I'm having trouble connecting right now. Please try again in a moment.";
        }
    }

    /**
     * Extract structured campaign data from the response and save it.
     */
    private function extractAndSaveCampaignData(string $response, User $user): void
    {
        if (! preg_match('/\[DATA: (.*?)\]/', $response, $matches)) {
            return;
        }

        $dataString = $matches[1];
        $settings = ApexUserSettings::forUser($user);
        $context = $settings->apex_context ? json_decode($settings->apex_context, true) : [];

        $fields = [
            'campaign_name',
            'campaign_type',
            'campaign_goal',
            'offer',
            'company_size',
            'excluded_locations',
            'job_titles',
            'locations',
            'keywords',
            'industries',
            'connection_message',
            'follow_up_message_1',
            'follow_up_message_2',
            'follow_up_message_3',
            'follow_up_delay_days_1',
            'follow_up_delay_days_2',
            'follow_up_delay_days_3',
            'booking_method',
            'calendar_link',
            'daily_connection_limit',
            'daily_message_limit',
            'autopilot_mode',
            'reply_handling',
            'onboarding_confirmed',
        ];

        $updated = false;

        foreach ($fields as $field) {
            if (preg_match('/'.$field.'="([^"]+)"/', $dataString, $match)) {
                $context[$field] = trim($match[1]);
                $updated = true;
            }
        }

        if ($updated) {
            $settings->update([
                'apex_context' => json_encode($context),
                'apex_context_updated_at' => now(),
            ]);

            // Sync onboarding completion flag
            if (isset($context['onboarding_confirmed']) && strtolower($context['onboarding_confirmed']) === 'true') {
                $settings->update(['onboarding_completed' => true]);
            }

            // Sync autopilot mode to settings columns
            if (isset($context['autopilot_mode'])) {
                $enabled = strtolower($context['autopilot_mode']) === 'autopilot_on';
                $settings->update([
                    'autopilot_enabled' => $enabled,
                    'auto_reply_enabled' => $enabled,
                ]);
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
                'agent' => 'apex',
                'conversation_excerpt' => array_slice($conversationHistory, -4),
            ]);
        }
    }

    /**
     * Remove [DATA: ...] and [ESCALATE: ...] markers from the response.
     */
    private function stripInternalMarkers(string $response): string
    {
        $cleaned = preg_replace('/\[DATA:.*?\]/s', '', $response);
        $cleaned = preg_replace('/\[ESCALATE:.*?\]/s', '', $cleaned);
        $cleaned = preg_replace('/\n{3,}/', "\n\n", $cleaned);

        return trim($cleaned);
    }
}
