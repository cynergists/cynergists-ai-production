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
        // Debug: Log request details
        Log::info('Voice API Request Received', [
            'agent_id' => $agentId,
            'has_user' => $request->user() !== null,
            'user_id' => $request->user()?->id,
            'headers' => $request->headers->all(),
            'input' => $request->all(),
        ]);

        $request->validate([
            'message' => 'required|string|max:10000',
            'textOnly' => 'boolean',
        ]);

        try {
            $user = $request->user();

            if (! $user) {
                Log::error('No authenticated user in voice request');

                return response()->json(['error' => 'Unauthenticated'], 401);
            }

            $textOnly = $request->input('textOnly', false);

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
                return response()->json([
                    'error' => 'Tenant not found',
                ], 404);
            }

            $message = $request->input('message');

            // If textOnly is true, just convert the message to speech without processing
            if ($textOnly) {
                $textResponse = $message;
            } else {
                // Process message based on agent type
                $agentName = strtolower($agentAccess->agent_name);

                $textResponse = match ($agentName) {
                    'cynessa' => app(CynessaAgentHandler::class)->handleMessage($user, $message),
                    default => "I'm sorry, voice mode is not yet available for this agent."
                };
            }

            // Get ElevenLabs API key for this agent
            $elevenLabsKey = $agentAccess->availableAgent->apiKeys()
                ->where('provider', 'elevenlabs')
                ->where('is_active', true)
                ->first();

            if (! $elevenLabsKey) {
                Log::warning("No ElevenLabs API key found for agent: {$agentAccess->agent_name}");

                return response()->json([
                    'success' => true,
                    'text' => $textResponse,
                    'audio' => null,
                    'error' => 'Voice output not available for this agent',
                ]);
            }

            // Get the API key (automatically decrypted by model cast)
            $decryptedKey = $elevenLabsKey->key;

            // Debug: Log the decrypted key
            Log::info('ElevenLabs API Key', [
                'key_length' => strlen($decryptedKey),
                'agent' => $agentAccess->agent_name,
            ]);

            // Get voice ID from metadata or use default
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
                        'error' => 'No voice configured for this agent',
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
                Log::error('ElevenLabs TTS failed', ['error' => $ttsResult['error'] ?? 'Unknown error']);

                return response()->json([
                    'success' => true,
                    'text' => $textResponse,
                    'audio' => null,
                    'error' => 'Failed to generate voice response',
                ]);
            }

            return response()->json([
                'success' => true,
                'text' => $textResponse,
                'audio' => $ttsResult['audio'], // base64 encoded audio
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
