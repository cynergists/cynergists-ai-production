<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PublicChatController extends Controller
{
    /**
     * Handle public chatbot messages (for cynergists.ai homepage)
     */
    public function chat(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'messages' => 'required|array',
            'messages.*.role' => 'required|in:user,assistant',
            'messages.*.content' => 'required|string',
        ]);

        $messages = $validated['messages'];

        try {
            // Call Anthropic API
            $response = Http::withHeaders([
                'x-api-key' => config('services.anthropic.api_key'),
                'anthropic-version' => '2023-06-01',
                'content-type' => 'application/json',
            ])->post('https://api.anthropic.com/v1/messages', [
                'model' => 'claude-3-5-sonnet-20241022',
                'max_tokens' => 512,
                'system' => 'You are Cynessa, a friendly AI assistant for Cynergists. Help users learn about Cynergists services, AI agents, and pricing. Be concise and helpful. If asked about specific agents, provide brief overviews.',
                'messages' => $messages,
            ]);

            if (! $response->successful()) {
                Log::error('Anthropic API error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return response()->json([
                    'error' => 'Failed to get response from AI',
                ], 500);
            }

            $data = $response->json();

            return response()->json([
                'content' => $data['content'][0]['text'] ?? 'Sorry, I could not generate a response.',
                'role' => 'assistant',
            ]);
        } catch (\Exception $e) {
            Log::error('Public chat error', [
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'An error occurred',
            ], 500);
        }
    }
}
