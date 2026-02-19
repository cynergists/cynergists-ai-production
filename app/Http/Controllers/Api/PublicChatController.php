<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PortalAvailableAgent;
use App\Models\PortalTenant;
use App\Models\User;
use App\Services\Ai\ConversationHistoryWindow;
use App\Services\Cynessa\CynessaAgentHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PublicChatController extends Controller
{
    public function __construct(
        private CynessaAgentHandler $cynessaAgentHandler,
        private ConversationHistoryWindow $conversationHistoryWindow
    ) {}

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

        $userMessages = array_values(array_filter(
            $validated['messages'],
            fn (array $message) => $message['role'] === 'user'
        ));

        $lastMessage = end($userMessages);
        $messageText = $lastMessage['content'] ?? '';

        if (! is_string($messageText) || trim($messageText) === '') {
            return response()->json(['error' => 'No message provided'], 400);
        }

        $conversationHistory = array_values(array_map(
            fn (array $message) => [
                'role' => $message['role'],
                'content' => $message['content'],
            ],
            array_slice($validated['messages'], 0, -1)
        ));

        $conversationHistory = $this->conversationHistoryWindow->trim($conversationHistory);

        try {
            $guestUser = User::query()->firstOrCreate(
                ['email' => 'public-chatbot@cynergists.ai'],
                [
                    'name' => 'Public Chatbot User',
                    'password' => Hash::make(Str::random(40)),
                    'is_active' => true,
                ],
            );

            $guestTenant = PortalTenant::query()->firstOrCreate(
                ['user_id' => (string) $guestUser->id],
                [
                    'id' => (string) Str::uuid(),
                    'company_name' => 'Public Visitor',
                    'subdomain' => 'public-chatbot-'.Str::lower(Str::random(8)),
                    'is_temp_subdomain' => true,
                    'primary_color' => '#22c55e',
                    'settings' => [],
                    'status' => 'active',
                ],
            );

            $cynessaAgent = PortalAvailableAgent::query()
                ->where('name', 'Cynessa')
                ->first();

            if (! $cynessaAgent) {
                $cynessaAgent = new PortalAvailableAgent([
                    'name' => 'Cynessa',
                    'is_active' => true,
                ]);
            }

            $assistantMessage = $this->cynessaAgentHandler->handle(
                message: $messageText,
                user: $guestUser,
                agent: $cynessaAgent,
                tenant: $guestTenant,
                conversationHistory: $conversationHistory
            );

            return response()->json([
                'content' => $assistantMessage,
                'role' => 'assistant',
            ]);
        } catch (\Throwable $e) {
            Log::error('Public Cynessa error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'content' => "I'm having trouble right now. Please try again in a moment.",
                'role' => 'assistant',
            ]);
        }
    }
}
