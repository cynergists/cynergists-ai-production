<?php

namespace App\Services\Beacon;

use App\Ai\Agents\Beacon;
use App\Models\PortalAvailableAgent;
use App\Models\PortalTenant;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class BeaconAgentHandler
{
    /**
     * Handle an incoming chat message and generate a response.
     */
    public function handle(string $message, User $user, PortalAvailableAgent $agent, PortalTenant $tenant, array $conversationHistory = [], int $maxTokens = 1024): string
    {
        try {
            $beaconAgent = new Beacon(
                user: $user,
                tenant: $tenant,
                conversationHistory: $conversationHistory
            );

            $response = $beaconAgent->prompt(
                prompt: $message,
                provider: 'anthropic',
                timeout: 120
            );

            $responseText = (string) $response;

            // Process any event configuration commands
            $processedResponse = $this->processEventConfiguration($responseText, $user, $tenant);

            return $this->stripInternalMarkers($processedResponse);
        } catch (\Exception $e) {
            Log::error('Laravel AI error in Beacon: '.$e->getMessage(), [
                'exception' => $e,
                'user_id' => $user->id,
                'tenant_id' => $tenant->id,
            ]);

            return "I'm experiencing technical difficulties. Please try again in a moment. If this persists, our Mission Control team will investigate immediately.";
        }
    }

    /**
     * Process event configuration markers in the response.
     */
    private function processEventConfiguration(string $response, User $user, PortalTenant $tenant): string
    {
        // TODO: Implement event configuration processing
        // Look for markers like [EVENT_CREATED], [REMINDER_SET], etc.
        // This would integrate with a future BeaconEvent model
        
        // For now, just return the response as-is
        return $response;
    }

    /**
     * Remove internal processing markers from the response.
     */
    private function stripInternalMarkers(string $response): string
    {
        // Remove any internal configuration markers
        $cleaned = preg_replace('/\[EVENT_.*?\]/s', '', $response);
        $cleaned = preg_replace('/\[REMINDER_.*?\]/s', '', $cleaned);
        $cleaned = preg_replace('/\[CONFIG_.*?\]/s', '', $cleaned);
        $cleaned = preg_replace('/\n{3,}/', "\n\n", $cleaned);

        return trim($cleaned);
    }
}