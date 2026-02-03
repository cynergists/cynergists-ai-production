<?php

namespace App\Http\Controllers\Api\Portal;

use App\Http\Controllers\Controller;
use App\Http\Requests\Portal\SendMessageRequest;
use App\Models\AgentAccess;
use App\Models\AgentConversation;
use App\Models\PortalAvailableAgent;
use App\Models\PortalTenant;
use App\Services\Apex\ApexAgentHandler;
use App\Services\Cynessa\CynessaAgentHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PortalChatController extends Controller
{
    public function __construct(
        private ApexAgentHandler $apexAgentHandler,
        private CynessaAgentHandler $cynessaAgentHandler
    ) {}

    public function conversation(Request $request, string $agent): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['conversation' => null], 401);
        }

        $tenant = PortalTenant::forUser($user);
        if (! $tenant) {
            return response()->json(['conversation' => null], 404);
        }

        $agentAccess = AgentAccess::query()
            ->where('tenant_id', $tenant->id)
            ->where('id', $agent)
            ->first();

        if (! $agentAccess) {
            return response()->json(['conversation' => null], 404);
        }

        $conversation = AgentConversation::query()
            ->where('agent_access_id', $agentAccess->id)
            ->where('status', 'active')
            ->orderByDesc('created_at')
            ->first(['id', 'messages']);

        return response()->json([
            'conversation' => $conversation,
        ]);
    }

    public function sendMessage(SendMessageRequest $request, string $agent): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['success' => false], 401);
        }

        $tenant = PortalTenant::forUser($user);
        if (! $tenant) {
            return response()->json(['success' => false], 404);
        }

        $agentAccess = AgentAccess::query()
            ->where('tenant_id', $tenant->id)
            ->where('id', $agent)
            ->where('is_active', true)
            ->first();

        if (! $agentAccess) {
            return response()->json(['success' => false], 404);
        }

        $conversation = AgentConversation::query()
            ->where('agent_access_id', $agentAccess->id)
            ->where('status', 'active')
            ->orderByDesc('created_at')
            ->first();

        if (! $conversation) {
            $conversation = AgentConversation::query()->create([
                'id' => (string) Str::uuid(),
                'agent_access_id' => $agentAccess->id,
                'customer_id' => $tenant->id,
                'title' => 'New Conversation',
                'messages' => [],
                'status' => 'active',
                'tenant_id' => $tenant->id,
            ]);
        }

        $userMessage = $request->validated('message');
        $messages = $conversation->messages ?? [];
        $messages[] = [
            'role' => 'user',
            'content' => $userMessage,
        ];

        // Generate the assistant response based on agent type
        $assistantMessage = $this->generateResponse($agentAccess, $userMessage, $user);

        $messages[] = [
            'role' => 'assistant',
            'content' => $assistantMessage,
        ];

        $conversation->update([
            'messages' => $messages,
            'updated_at' => now(),
        ]);

        $agentAccess->update([
            'usage_count' => ($agentAccess->usage_count ?? 0) + 1,
            'last_used_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'conversationId' => $conversation->id,
            'assistantMessage' => $assistantMessage,
            'messages' => $messages,
        ]);
    }

    /**
     * Generate a response based on the agent type.
     */
    private function generateResponse(AgentAccess $agentAccess, string $message, $user): string
    {
        $tenant = PortalTenant::forUser($user);

        // Check if this is the Apex agent
        if (strtolower($agentAccess->agent_name) === 'apex') {
            $availableAgent = PortalAvailableAgent::query()
                ->where('name', $agentAccess->agent_name)
                ->first();

            if ($availableAgent) {
                return $this->apexAgentHandler->handle($message, $user, $availableAgent);
            }
        }

        // Check if this is the Cynessa agent
        if (strtolower($agentAccess->agent_name) === 'cynessa') {
            $availableAgent = PortalAvailableAgent::query()
                ->where('name', $agentAccess->agent_name)
                ->first();

            if ($availableAgent && $tenant) {
                return $this->cynessaAgentHandler->handle($message, $user, $availableAgent, $tenant);
            }
        }

        // Default response for other agents
        return sprintf(
            "Thanks for the message! %s is moving this agent to the new Laravel pipeline. We'll respond soon.",
            $agentAccess->agent_name
        );
    }
}
