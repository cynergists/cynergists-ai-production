<?php

namespace App\Http\Controllers\Api\Portal;

use App\Http\Controllers\Controller;
use App\Models\AgentAccess;
use App\Models\PortalAvailableAgent;
use App\Models\PortalTenant;
use App\Services\Carbon\CarbonAgentHandler;
use App\Services\Cynessa\CynessaAgentHandler;
use App\Services\ElevenLabsService;
use App\Services\Luna\LunaAgentHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
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

            // Get tenant first
            $tenant = PortalTenant::forUser($user);
            if (! $tenant) {
                return response()->json(['error' => 'Tenant not found'], 404);
            }

            // Get the agent access
            $agentAccess = AgentAccess::with('availableAgent.apiKeys')
                ->where('id', $agentId)
                ->where('tenant_id', $tenant->id)
                ->first();

            // If agent not found, check if it's Cynessa (always available)
            if (! $agentAccess) {
                $cynessaAvailable = PortalAvailableAgent::with('apiKeys')
                    ->where('name', 'Cynessa')
                    ->first();

                if ($cynessaAvailable) {
                    // Create a virtual agent access for Cynessa
                    $agentAccess = new AgentAccess([
                        'id' => $agentId,
                        'agent_type' => 'assistant',
                        'agent_name' => 'Cynessa',
                        'configuration' => null,
                        'is_active' => true,
                        'usage_count' => 0,
                        'usage_limit' => null,
                        'last_used_at' => null,
                        'tenant_id' => $tenant->id,
                    ]);
                    $agentAccess->exists = false;
                    $agentAccess->setRelation('availableAgent', $cynessaAvailable);
                } else {
                    return response()->json(['error' => 'Agent not found'], 404);
                }
            }

            // Ensure availableAgent with apiKeys is loaded for subscription-based agents
            if (! $agentAccess->relationLoaded('availableAgent') || ! $agentAccess->availableAgent) {
                $available = PortalAvailableAgent::with('apiKeys')
                    ->where('name', $agentAccess->agent_name)
                    ->first();

                if ($available) {
                    $agentAccess->setRelation('availableAgent', $available);
                }
            }

            $message = $request->input('message');

            // Process message based on agent type
            $agentName = strtolower($agentAccess->agent_name);

            // Prepend instruction for very brief voice responses
            $voiceMessage = "IMPORTANT: This is voice mode - keep your response to 1-2 sentences maximum, conversational and natural.\n\n{$message}";

            $textResponse = match ($agentName) {
                'cynessa' => app(CynessaAgentHandler::class)->handle(
                    message: $voiceMessage,
                    user: $user,
                    agent: $agentAccess->availableAgent,
                    tenant: $tenant,
                    conversationHistory: [],
                    maxTokens: 128
                ),
                'luna' => app(LunaAgentHandler::class)->handle(
                    message: $voiceMessage,
                    user: $user,
                    agent: $agentAccess->availableAgent,
                    tenant: $tenant,
                    conversationHistory: [],
                    maxTokens: 128
                ),
                'carbon' => app(CarbonAgentHandler::class)->handle(
                    message: $voiceMessage,
                    user: $user,
                    agent: $agentAccess->availableAgent,
                    tenant: $tenant,
                    conversationHistory: [],
                    maxTokens: 128
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

            // Generate TTS synchronously
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

    /**
     * Check TTS job status and retrieve audio if ready.
     */
    public function checkTtsStatus(Request $request, string $jobId): JsonResponse
    {
        try {
            $user = $request->user();

            if (! $user) {
                return response()->json(['error' => 'Unauthenticated'], 401);
            }

            // Check cache for job status
            $result = Cache::get("voice_tts:{$jobId}");

            if (! $result) {
                return response()->json([
                    'status' => 'processing',
                ]);
            }

            if ($result['status'] === 'completed') {
                return response()->json([
                    'status' => 'completed',
                    'audio' => $result['audio'],
                ]);
            }

            if ($result['status'] === 'failed') {
                return response()->json([
                    'status' => 'failed',
                    'error' => $result['error'] ?? 'Unknown error',
                ]);
            }

            return response()->json([
                'status' => 'processing',
            ]);

        } catch (\Exception $e) {
            Log::error('TTS status check error', [
                'error' => $e->getMessage(),
                'job_id' => $jobId,
            ]);

            return response()->json([
                'error' => 'Failed to check TTS status',
            ], 500);
        }
    }
}
