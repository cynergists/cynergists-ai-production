<?php

namespace App\Services\Luna;

use App\Ai\Agents\Luna;
use App\Jobs\Luna\GenerateLunaImageJob;
use App\Models\LunaGeneratedImage;
use App\Models\PortalAvailableAgent;
use App\Models\PortalTenant;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class LunaAgentHandler
{
    /**
     * Handle an incoming chat message and generate a response.
     */
    public function handle(string $message, User $user, PortalAvailableAgent $agent, PortalTenant $tenant, array $conversationHistory = [], int $maxTokens = 1024): string
    {
        try {
            $lunaAgent = new Luna(
                user: $user,
                tenant: $tenant,
                conversationHistory: $conversationHistory
            );

            $response = $lunaAgent->prompt(
                prompt: $message,
                provider: 'gemini',
                timeout: 120
            );

            $responseText = (string) $response;

            // Check for image generation request and dispatch async job
            $imageResult = $this->processImageGeneration($responseText, $user, $tenant);

            if ($imageResult) {
                $responseText = $imageResult['cleanedResponse'];
                $responseText .= "\n\n[IMAGE_PENDING:".$imageResult['imageRecordId'].']';
            }

            return $this->stripInternalMarkers($responseText);
        } catch (\Exception $e) {
            Log::error('Laravel AI error in Luna: '.$e->getMessage(), [
                'exception' => $e,
                'user_id' => $user->id,
                'tenant_id' => $tenant->id,
            ]);

            return "I'm having trouble connecting right now. Please try again in a moment.";
        }
    }

    /**
     * Process image generation request asynchronously.
     *
     * @return array{cleanedResponse: string, imageRecordId: string}|null
     */
    private function processImageGeneration(string $response, User $user, PortalTenant $tenant): ?array
    {
        if (! preg_match('/\[GENERATE_IMAGE:\s*(.*?)\]/s', $response, $matches)) {
            return null;
        }

        $imagePrompt = trim($matches[1]);

        // Detect aspect ratio
        $aspectRatio = 'landscape';
        if (preg_match('/\[ASPECT:\s*(landscape|portrait|square)\]/i', $response, $aspectMatch)) {
            $aspectRatio = strtolower(trim($aspectMatch[1]));
        }

        // Create a pending record
        $imageRecordId = (string) Str::uuid();

        LunaGeneratedImage::query()->create([
            'id' => $imageRecordId,
            'tenant_id' => $tenant->id,
            'user_id' => (string) $user->id,
            'prompt' => $imagePrompt,
            'storage_path' => null,
            'public_url' => null,
            'aspect_ratio' => $aspectRatio,
            'quality' => 'high',
            'status' => 'pending',
            'metadata' => [
                'original_prompt' => $imagePrompt,
                'requested_at' => now()->toDateTimeString(),
            ],
        ]);

        // Dispatch the generation job
        GenerateLunaImageJob::dispatch($imageRecordId);

        // Remove the generation markers from the response text
        $cleanedResponse = preg_replace('/\[GENERATE_IMAGE:.*?\]/s', '', $response);
        $cleanedResponse = preg_replace('/\[ASPECT:.*?\]/s', '', $cleanedResponse);
        $cleanedResponse = preg_replace('/\n{3,}/', "\n\n", $cleanedResponse);

        return [
            'cleanedResponse' => trim($cleanedResponse),
            'imageRecordId' => $imageRecordId,
        ];
    }

    /**
     * Remove internal markers from the response.
     */
    private function stripInternalMarkers(string $response): string
    {
        $cleaned = preg_replace('/\[GENERATE_IMAGE:.*?\]/s', '', $response);
        $cleaned = preg_replace('/\[ASPECT:.*?\]/s', '', $cleaned);
        $cleaned = preg_replace('/\n{3,}/', "\n\n", $cleaned);

        return trim($cleaned);
    }
}
