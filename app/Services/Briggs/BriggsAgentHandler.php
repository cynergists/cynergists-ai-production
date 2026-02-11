<?php

namespace App\Services\Briggs;

use App\Ai\Agents\Briggs;
use App\Models\BriggsUserSettings;
use App\Models\PortalAvailableAgent;
use App\Models\PortalTenant;
use App\Models\User;
use App\Services\SlackEscalationService;
use Illuminate\Support\Facades\Log;
use Laravel\Ai\Exceptions\RateLimitedException;

class BriggsAgentHandler
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
            $briggsAgent = new Briggs(
                user: $user,
                tenant: $tenant,
                conversationHistory: $conversationHistory
            );

            $response = $briggsAgent->prompt(
                prompt: $message,
                model: 'claude-sonnet-4-5-20250929',
                timeout: 120
            );

            $responseText = (string) $response;

            // Extract any structured data from the response
            $this->extractAndSaveData($responseText, $user);

            // Handle escalation markers
            $this->handleEscalation($responseText, $tenant, $user, $conversationHistory);

            // Strip internal markers before returning to user
            return $this->stripInternalMarkers($responseText);

        } catch (RateLimitedException $e) {
            Log::warning('Briggs rate limited by AI provider', [
                'user_id' => $user->id,
                'tenant_id' => $tenant->id,
            ]);

            return "I'm getting a lot of requests right now. Give me about 30 seconds and try again.";
        } catch (\Exception $e) {
            Log::error('Laravel AI error in Briggs: '.$e->getMessage(), [
                'exception' => $e,
                'user_id' => $user->id,
                'tenant_id' => $tenant->id,
            ]);

            return "I'm having trouble connecting right now. Please try again in a moment.";
        }
    }

    /**
     * Extract structured data from the response and save it.
     */
    private function extractAndSaveData(string $response, User $user): void
    {
        if (! preg_match('/\[DATA: (.*?)\]/', $response, $matches)) {
            return;
        }

        $dataString = $matches[1];
        $settings = BriggsUserSettings::forUser($user);
        $context = $settings->briggs_context ? json_decode($settings->briggs_context, true) : [];

        $fields = [
            'skill_level',
            'preferred_industry',
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
                'briggs_context' => json_encode($context),
                'briggs_context_updated_at' => now(),
            ]);

            // Sync onboarding completion
            if (isset($context['onboarding_confirmed']) && strtolower($context['onboarding_confirmed']) === 'true') {
                $settings->update(['onboarding_completed' => true]);
            }

            // Sync skill level to settings column
            if (isset($context['skill_level'])) {
                $validLevels = ['beginner', 'intermediate', 'advanced'];
                $level = strtolower($context['skill_level']);

                if (in_array($level, $validLevels)) {
                    $settings->update(['skill_level' => $level]);
                }
            }

            // Sync preferred industry to settings column
            if (isset($context['preferred_industry'])) {
                $settings->update(['preferred_industry' => $context['preferred_industry']]);
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
                'agent' => 'briggs',
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
