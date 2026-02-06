<?php

namespace App\Http\Controllers\Api\Portal;

use App\Http\Controllers\Controller;
use App\Http\Requests\Portal\SendMessageRequest;
use App\Http\Requests\Portal\UploadFileRequest;
use App\Models\AgentAccess;
use App\Models\AgentConversation;
use App\Models\PortalAvailableAgent;
use App\Models\PortalTenant;
use App\Services\Apex\ApexAgentHandler;
use App\Services\Carbon\CarbonAgentHandler;
use App\Services\Cynessa\CynessaAgentHandler;
use App\Services\Cynessa\OnboardingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PortalChatController extends Controller
{
    public function __construct(
        private ApexAgentHandler $apexAgentHandler,
        private CarbonAgentHandler $carbonAgentHandler,
        private CynessaAgentHandler $cynessaAgentHandler,
        private OnboardingService $onboardingService
    ) {}

    /**
     * Get or create a virtual Cynessa agent access for any user.
     */
    private function getOrCreateCynessaAccess(string $agentId, PortalTenant $tenant): ?AgentAccess
    {
        // First check if user actually has Cynessa access
        $agentAccess = AgentAccess::query()
            ->where('tenant_id', $tenant->id)
            ->where('id', $agentId)
            ->first();

        if ($agentAccess) {
            return $agentAccess;
        }

        // Check if Cynessa is available
        $cynessaAvailable = PortalAvailableAgent::query()
            ->where('name', 'Cynessa')
            ->first();

        if (! $cynessaAvailable) {
            return null;
        }

        // Create a virtual agent access for Cynessa
        $cynessaAgent = new AgentAccess([
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

        // Set exists to false so we know not to save it
        $cynessaAgent->exists = false;

        return $cynessaAgent;
    }

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

        $agentAccess = $this->getOrCreateCynessaAccess($agent, $tenant);

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

        $agentAccess = $this->getOrCreateCynessaAccess($agent, $tenant);

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

        // Generate the assistant response with conversation history (before adding current message)
        $assistantMessage = $this->generateResponse($agentAccess, $userMessage, $user, $messages);

        $messages[] = [
            'role' => 'user',
            'content' => $userMessage,
        ];

        $messages[] = [
            'role' => 'assistant',
            'content' => $assistantMessage,
        ];

        $conversation->update([
            'messages' => $messages,
            'updated_at' => now(),
        ]);

        // Only update usage if this is a real agent access record
        if ($agentAccess->exists) {
            $agentAccess->update([
                'usage_count' => ($agentAccess->usage_count ?? 0) + 1,
                'last_used_at' => now(),
            ]);
        }

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
    private function generateResponse(AgentAccess $agentAccess, string $message, $user, array $conversationHistory = []): string
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
                return $this->cynessaAgentHandler->handle($message, $user, $availableAgent, $tenant, $conversationHistory);
            }
        }

        // Check if this is the Carbon agent
        if (strtolower($agentAccess->agent_name) === 'carbon') {
            $availableAgent = PortalAvailableAgent::query()
                ->where('name', $agentAccess->agent_name)
                ->first();

            if ($availableAgent && $tenant) {
                return $this->carbonAgentHandler->handle($message, $user, $availableAgent, $tenant, $conversationHistory);
            }
        }

        // Default response for other agents
        return sprintf(
            "Thanks for the message! %s is moving this agent to the new Laravel pipeline. We'll respond soon.",
            $agentAccess->agent_name
        );
    }

    /**
     * Upload a file for an agent (e.g., brand assets for Cynessa).
     */
    public function uploadFile(UploadFileRequest $request, string $agent): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $tenant = PortalTenant::forUser($user);
        if (! $tenant) {
            return response()->json(['success' => false, 'message' => 'Tenant not found'], 404);
        }

        $agentAccess = $this->getOrCreateCynessaAccess($agent, $tenant);

        if (! $agentAccess) {
            return response()->json(['success' => false, 'message' => 'Agent not found'], 404);
        }

        $file = $request->file('file');
        $filename = $file->getClientOriginalName();
        $type = $request->input('type', 'brand_asset');

        // Store file in tenant-specific directory
        $path = $file->store(
            "tenants/{$tenant->id}/brand_assets",
            'public'
        );

        // Track the uploaded file
        $this->onboardingService->trackBrandAsset($tenant, $filename, $path, $type);

        // Get conversation to add upload notification
        $conversation = AgentConversation::query()
            ->where('agent_access_id', $agentAccess->id)
            ->where('status', 'active')
            ->orderByDesc('created_at')
            ->first();

        $confirmationMessage = null;
        if ($conversation && strtolower($agentAccess->agent_name) === 'cynessa') {
            $messages = $conversation->messages ?? [];

            // Add user message about the file upload
            $fileExtension = pathinfo($filename, PATHINFO_EXTENSION);
            $fileSize = number_format($file->getSize() / 1024, 2); // KB

            $userMessage = "[File uploaded: {$filename} ({$fileSize} KB, .{$fileExtension})]";
            $messages[] = [
                'role' => 'user',
                'content' => $userMessage,
            ];

            // Let Cynessa respond to the file upload with full history
            $availableAgent = \App\Models\PortalAvailableAgent::query()
                ->where('name', $agentAccess->agent_name)
                ->first();

            if ($availableAgent) {
                // Pass the conversation history (before adding the new upload message)
                $historyBeforeUpload = array_slice($messages, 0, -1);

                $confirmationMessage = $this->cynessaAgentHandler->handle(
                    $userMessage,
                    $user,
                    $availableAgent,
                    $tenant,
                    $historyBeforeUpload
                );

                $messages[] = [
                    'role' => 'assistant',
                    'content' => $confirmationMessage,
                ];
            }

            $conversation->update([
                'messages' => $messages,
                'updated_at' => now(),
            ]);
        }

        return response()->json([
            'success' => true,
            'file' => [
                'filename' => $filename,
                'path' => $path,
                'url' => Storage::disk('public')->url($path),
                'type' => $type,
            ],
            'message' => $confirmationMessage,
            'messages' => $messages ?? null,
        ]);
    }

    /**
     * Clear/delete the active conversation for an agent.
     */
    public function clearConversation(Request $request, string $agent): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $tenant = PortalTenant::forUser($user);
        if (! $tenant) {
            return response()->json(['success' => false, 'message' => 'Tenant not found'], 404);
        }

        $agentAccess = $this->getOrCreateCynessaAccess($agent, $tenant);

        if (! $agentAccess) {
            return response()->json(['success' => false, 'message' => 'Agent not found'], 404);
        }

        // Find and delete the active conversation
        $deleted = AgentConversation::query()
            ->where('agent_access_id', $agentAccess->id)
            ->where('status', 'active')
            ->delete();

        return response()->json([
            'success' => true,
            'deleted' => $deleted > 0,
        ]);
    }
}
