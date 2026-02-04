<?php

namespace App\Http\Controllers\Api\Portal;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessVoiceTextToSpeech;
use App\Models\AgentAccess;
use App\Models\PortalTenant;
use App\Services\Cynessa\CynessaAgentHandler;
use App\Services\ElevenLabsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

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
            'queueTts' => 'boolean',  // If true, queue TTS generation instead of doing it synchronously
        ]);

        try {
            $user = $request->user();

            if (! $user) {
                Log::error('No authenticated user in voice request');

                return response()->json(['error' => 'Unauthenticated'], 401);
            }

            $textOnly = $request->input('textOnly', false);
            $queueTts = $request->input('queueTts', false);

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
                    'cynessa' => app(CynessaAgentHandler::class)->handle(
                        message: $message,
                        user: $user,
                        agent: $agentAccess->availableAgent,
                        tenant: $tenant,
                        conversationHistory: [],
                        maxTokens: 512  // Reduced from 1024 for faster voice responses
                    ),
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
            if ($queueTts) {
                // Queue TTS generation for background processing
                $jobId = Str::uuid()->toString();

                ProcessVoiceTextToSpeech::dispatch(
                    $jobId,
                    $textResponse,
                    $decryptedKey,
                    $voiceId,
                    [
                        'stability' => $elevenLabsKey->metadata['stability'] ?? 0.5,
                        'similarity_boost' => $elevenLabsKey->metadata['similarity_boost'] ?? 0.75,
                        'model_id' => $elevenLabsKey->metadata['model_id'] ?? 'eleven_monolingual_v1',
                    ]
                );

                // Return immediately with text and job ID
                return response()->json([
                    'success' => true,
                    'text' => $textResponse,
                    'audio' => null,
                    'tts_job_id' => $jobId,
                    'tts_status_url' => route('api.portal.voice.tts.status', ['jobId' => $jobId]),
                ]);
            }

            // Synchronous TTS generation (default behavior)
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
                    'status' => 'not_found',
                    'error' => 'Job not found or expired',
                ], 404);
            }

            if ($result['status'] === 'completed') {
                return response()->json([
                    'status' => 'completed',
                    'audio' => $result['audio'],
                    'text' => $result['text'],
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
