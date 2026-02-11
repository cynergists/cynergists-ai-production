<?php

namespace App\Services\Carbon;

use App\Ai\Agents\Carbon;
use App\Models\PortalAvailableAgent;
use App\Models\PortalTenant;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class CarbonAgentHandler
{
    /**
     * Handle an incoming chat message and generate a response.
     */
    public function handle(string $message, User $user, PortalAvailableAgent $agent, PortalTenant $tenant, array $conversationHistory = [], int $maxTokens = 1024): string
    {
        try {
            $carbonAgent = new Carbon(
                user: $user,
                tenant: $tenant,
                conversationHistory: $conversationHistory
            );

            $response = $carbonAgent->prompt(
                prompt: $message,
                model: 'claude-sonnet-4-5-20250929',
                timeout: 120
            );

            return (string) $response;
        } catch (\Exception $e) {
            Log::error('Laravel AI error in Carbon: '.$e->getMessage(), [
                'exception' => $e,
                'user_id' => $user->id,
                'tenant_id' => $tenant->id,
            ]);

            return "I'm having trouble connecting right now. Please try again in a moment.";
        }
    }
}
