<?php

namespace App\Http\Controllers\Api\Portal;

use App\Http\Controllers\Controller;
use App\Models\AgentAccess;
use App\Models\PortalTenant;
use App\Services\Cynessa\CynessaAgentHandler;
use App\Services\ElevenLabsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class VoiceController extends Controller
{
    /**
     * Process voice message from user.
     */
    public function processVoiceMessage(Request $request, string $agentId): JsonResponse
    {
        $request->validate([
            'message' => 'required|string|max:10000',
        ]);

        try {
            $user = $request->user();

            if (! $user) {
                return response()->json(['error' => 'Unauthenticated'], 401);
            }

            // Get the agent access
            $agentAccess = AgentAccess::with('availableAgent.apiKeys')
                ->where('id', $agentId)
                ->where('tenant_id', fn ($query) => $query->select('id')
                    ->from('portal_tenants')
                    ->where('user_id', $user->id)
                    ->limit(1)
                )
                ->firstOrFail();

            // Get tenant
            $tenant = PortalTenant::forUser($user);
            if (! $tenant) {
                return response()->json(['error' => 'Tenant not found'], 404);
            }

            $message = $request->input('message');

            // Process message based on agent type
            $agentName = strtolower($agentAccess->agent_name);

            $textResponse = match ($agentName) {
                'cynessa' => app(CynessaAgentHandler::class)->handle(
                    message: $message,
                    user: $user,
                    agent: $agentAccess->availableAgent,
                    tenant: $tenant,
                    conversationHistory: [],
                    maxTokens: 256  // Short responses for voice
                ),
                default => "I'm sorry, voice mode is not yet available for this agent."
            };

            // Get ElevenLabs API key for this agent
            $elevenLabsKey = $agentAccess->availableAgent->apiKeys()
                ->where('provider', 'elevenlabs')
                ->where('is_active', true)
                ->first();

            if (! $elevenLabsKey) {
                return response()->json([
                    'success' => true,
                    'text' => $textResponse,
                    'audio' => null,
                ]);
            }

            // Get the API key
            $decryptedKey = $elevenLabsKey->key;

            // Get voice ID from metadata
            $voiceId = $elevenLabsKey->metadata['voice_id'] ?? null;

            if (! $voiceId) {
                // Get first available voice
                $elevenLabs = new ElevenLabsService($decryptedKey);
                $voicesResult = $elevenLabs->getVoices();

                if ($voicesResult['success'] && ! empty($voicesResult['voices'])) {
                    $voiceId = $voicesResult['voices'][0]['voice_id'];
                } else {
                    return response()->json([
                        'success' => true,
                        'text' => $textResponse,
                        'audio' => null,
                    ]);
                }
            }

            // Convert text response to speech
            $elevenLabs = new ElevenLabsService($decryptedKey);
            $ttsResult = $elevenLabs->textToSpeech($textResponse, $voiceId, [
                'stability' => $elevenLabsKey->metadata['stability'] ?? 0.5,
                'similarity_boost' => $elevenLabsKey->metadata['similarity_boost'] ?? 0.75,
                'model_id' => $elevenLabsKey->metadata['model_id'] ?? 'eleven_monolingual_v1',
            ]);

            if (! $ttsResult['success']) {
                return response()->json([
                    'success' => true,
                    'text' => $textResponse,
                    'audio' => null,
                ]);
            }

            return response()->json([
                'success' => true,
                'text' => $textResponse,
                'audio' => $ttsResult['audio'],
            ]);

        } catch (\Exception $e) {
            Log::error('Voice message processing error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error' => 'Failed to process voice message',
                'message' => config('app.debug') ? $e->getMessage() : 'An error occurred',
            ], 500);
        }
    }
}
