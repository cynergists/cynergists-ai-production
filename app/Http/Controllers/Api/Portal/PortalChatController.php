<?php

namespace App\Http\Controllers\Api\Portal;

use App\Http\Controllers\Controller;
use App\Http\Requests\Portal\SendMessageRequest;
use App\Http\Requests\Portal\UploadFileRequest;
use App\Models\AgentAccess;
use App\Models\AgentConversation;
use App\Models\LunaGeneratedImage;
use App\Models\PortalAvailableAgent;
use App\Models\PortalTenant;
use App\Services\Aether\AetherAgentHandler;
use App\Services\Ai\ConversationHistoryWindow;
use App\Services\Apex\ApexAgentHandler;
use App\Services\Beacon\BeaconAgentHandler;
use App\Services\Briggs\BriggsAgentHandler;
use App\Services\Carbon\CarbonAgentHandler;
use App\Services\Cynessa\CynessaAgentHandler;
use App\Services\Cynessa\OnboardingService;
use App\Services\Impulse\ImpulseAgentHandler;
use App\Services\Kinetix\KinetixAgentHandler;
use App\Services\Luna\LunaAgentHandler;
use App\Services\Mosaic\MosaicAgentHandler;
use App\Services\Mosaic\MosaicMediaService;
use App\Services\Optix\OptixAgentHandler;
use App\Services\Vector\VectorAgentHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PortalChatController extends Controller
{
    public function __construct(
        private AetherAgentHandler $aetherAgentHandler,
        private ApexAgentHandler $apexAgentHandler,
        private BeaconAgentHandler $beaconAgentHandler,

        private BriggsAgentHandler $briggsAgentHandler,
        private CarbonAgentHandler $carbonAgentHandler,
        private CynessaAgentHandler $cynessaAgentHandler,
        private ImpulseAgentHandler $impulseAgentHandler,
        private KinetixAgentHandler $kinetixAgentHandler,
        private LunaAgentHandler $lunaAgentHandler,
        private MosaicAgentHandler $mosaicAgentHandler,
        private MosaicMediaService $mosaicMediaService,
        private OptixAgentHandler $optixAgentHandler,
        private VectorAgentHandler $vectorAgentHandler,
        private OnboardingService $onboardingService,
        private ConversationHistoryWindow $conversationHistoryWindow
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
        $promptHistory = $this->conversationHistoryWindow->trim($messages);

        // Generate the assistant response with conversation history (before adding current message)
        $assistantMessage = $this->generateResponse($agentAccess, $userMessage, $user, $promptHistory);

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

            if ($availableAgent && $tenant) {
                return $this->apexAgentHandler->handle($message, $user, $availableAgent, $tenant, $conversationHistory);
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

        // Check if this is the Luna agent
        if (strtolower($agentAccess->agent_name) === 'luna') {
            $availableAgent = PortalAvailableAgent::query()
                ->where('name', $agentAccess->agent_name)
                ->first();

            if ($availableAgent && $tenant) {
                return $this->lunaAgentHandler->handle($message, $user, $availableAgent, $tenant, $conversationHistory);
            }
        }

        // Check if this is the Mosaic agent
        if (strtolower($agentAccess->agent_name) === 'mosaic') {
            $availableAgent = PortalAvailableAgent::query()
                ->where('name', $agentAccess->agent_name)
                ->first();

            if ($availableAgent && $tenant) {
                return $this->mosaicAgentHandler->handle($message, $user, $availableAgent, $tenant, $conversationHistory);
            }
        }

        // Check if this is the Briggs agent
        if (strtolower($agentAccess->agent_name) === 'briggs') {
            $availableAgent = PortalAvailableAgent::query()
                ->where('name', $agentAccess->agent_name)
                ->first();

            if ($availableAgent && $tenant) {
                return $this->briggsAgentHandler->handle($message, $user, $availableAgent, $tenant, $conversationHistory);
            }
        }

        // Check if this is the Aether agent
        if (strtolower($agentAccess->agent_name) === 'aether') {
            $availableAgent = PortalAvailableAgent::query()
                ->where('name', $agentAccess->agent_name)
                ->first();

            if ($availableAgent && $tenant) {
                return $this->aetherAgentHandler->handle($message, $user, $availableAgent, $tenant, $conversationHistory);
            }
        }

        // Check if this is the Impulse agent
        if (strtolower($agentAccess->agent_name) === 'impulse') {
            $availableAgent = PortalAvailableAgent::query()
                ->where('name', $agentAccess->agent_name)
                ->first();

            if ($availableAgent && $tenant) {
                return $this->impulseAgentHandler->handle($message, $user, $availableAgent, $tenant, $conversationHistory);
            }
        }

        // Check if this is the Kinetix agent
        if (strtolower($agentAccess->agent_name) === 'kinetix') {
            $availableAgent = PortalAvailableAgent::query()
                ->where('name', $agentAccess->agent_name)
                ->first();

            if ($availableAgent && $tenant) {
                return $this->kinetixAgentHandler->handle($message, $user, $availableAgent, $tenant, $conversationHistory);
            }
        }

        // Check if this is the Optix agent
        if (strtolower($agentAccess->agent_name) === 'optix') {
            $availableAgent = PortalAvailableAgent::query()
                ->where('name', $agentAccess->agent_name)
                ->first();

            if ($availableAgent && $tenant) {
                return $this->optixAgentHandler->handle($message, $user, $availableAgent, $tenant, $conversationHistory);
            }
        }

        // Check if this is the Vector agent
        if (strtolower($agentAccess->agent_name) === 'vector') {
            $availableAgent = PortalAvailableAgent::query()
                ->where('name', $agentAccess->agent_name)
                ->first();

            if ($availableAgent && $tenant) {
                return $this->vectorAgentHandler->handle($message, $user, $availableAgent, $tenant, $conversationHistory);
            }
        }

        // Check if this is the Beacon agent
        if (strtolower($agentAccess->agent_name) === 'beacon') {
            $availableAgent = PortalAvailableAgent::query()
                ->where('name', $agentAccess->agent_name)
                ->first();

            if ($availableAgent && $tenant) {
                return $this->beaconAgentHandler->handle($message, $user, $availableAgent, $tenant, $conversationHistory);
            }
        }

        // Check if this is the Arsenal agent
        if (strtolower($agentAccess->agent_name) === 'arsenal') {
            if ($tenant) {
                $arsenalAgent = new \App\Ai\Agents\Arsenal(
                    user: $user,
                    tenant: $tenant,
                    conversationHistory: $conversationHistory
                );

                try {
                    $response = $arsenalAgent->prompt($message);

                    return (string) $response;
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error('Arsenal agent error: '.$e->getMessage());

                    return 'I\'m experiencing technical difficulties processing your catalog request. This has been logged for review. Please ensure your data sources are properly formatted.';
                }
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

        $warnings = [];

        // Handle Mosaic media processing
        if (strtolower($agentAccess->agent_name) === 'mosaic') {
            $mimeType = $file->getMimeType();

            if (str_starts_with($mimeType ?? '', 'image/')) {
                $result = $this->mosaicMediaService->processImage($file, $tenant);
                $path = $result['path'];
                $warnings = $result['warnings'];
            } elseif (str_starts_with($mimeType ?? '', 'video/')) {
                $result = $this->mosaicMediaService->processVideo($file, $tenant);
                $path = $result['path'];
                $warnings = $result['warnings'];
            } else {
                // Fallback for other file types
                $path = $file->store(
                    "tenants/{$tenant->id}/mosaic_assets",
                    'public'
                );
            }
        } else {
            // Store file in tenant-specific directory (for other agents)
            $path = $file->store(
                "tenants/{$tenant->id}/brand_assets",
                'public'
            );

            // Track the uploaded file for Cynessa
            if (strtolower($agentAccess->agent_name) === 'cynessa') {
                $this->onboardingService->trackBrandAsset($tenant, $filename, $path, $type);
            }
        }

        // Get conversation to add upload notification
        $conversation = AgentConversation::query()
            ->where('agent_access_id', $agentAccess->id)
            ->where('status', 'active')
            ->orderByDesc('created_at')
            ->first();

        $confirmationMessage = null;
        if ($conversation && in_array(strtolower($agentAccess->agent_name), ['cynessa', 'mosaic'], true)) {
            $messages = $conversation->messages ?? [];

            // Add user message about the file upload
            $fileExtension = pathinfo($filename, PATHINFO_EXTENSION);
            $fileSize = number_format($file->getSize() / 1024, 2); // KB

            $userMessage = "[File uploaded: {$filename} ({$fileSize} KB, .{$fileExtension})]";

            // Add warnings if any (for Mosaic)
            if (! empty($warnings)) {
                $userMessage .= "\nWarnings: ".implode('; ', $warnings);
            }

            $messages[] = [
                'role' => 'user',
                'content' => $userMessage,
            ];

            // Let the agent respond to the file upload with full history
            $availableAgent = \App\Models\PortalAvailableAgent::query()
                ->where('name', $agentAccess->agent_name)
                ->first();

            if ($availableAgent) {
                // Pass the conversation history (before adding the new upload message)
                $historyBeforeUpload = $this->conversationHistoryWindow->trim(
                    array_slice($messages, 0, -1)
                );

                if (strtolower($agentAccess->agent_name) === 'cynessa') {
                    $confirmationMessage = $this->cynessaAgentHandler->handle(
                        $userMessage,
                        $user,
                        $availableAgent,
                        $tenant,
                        $historyBeforeUpload
                    );
                } elseif (strtolower($agentAccess->agent_name) === 'mosaic') {
                    $confirmationMessage = $this->mosaicAgentHandler->handle(
                        $userMessage,
                        $user,
                        $availableAgent,
                        $tenant,
                        $historyBeforeUpload
                    );
                }

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

    /**
     * Restart onboarding for the tenant: clears onboarding data and conversation history.
     */
    public function restartOnboarding(Request $request, string $agent): JsonResponse
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

        $onboardingService = app(OnboardingService::class);
        $onboardingService->resetOnboarding($tenant);

        AgentConversation::query()
            ->where('agent_access_id', $agentAccess->id)
            ->where('status', 'active')
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'Onboarding restarted successfully.',
        ]);
    }

    /**
     * Check the status of a pending Luna image generation.
     */
    public function lunaImageStatus(Request $request, string $imageId): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $image = LunaGeneratedImage::query()
            ->where('id', $imageId)
            ->where('user_id', (string) $user->id)
            ->first();

        if (! $image) {
            return response()->json(['error' => 'Image not found'], 404);
        }

        $data = [
            'status' => $image->status,
        ];

        if ($image->status === 'completed') {
            $data['public_url'] = $image->public_url;
        }

        if ($image->status === 'failed') {
            $data['error_message'] = $image->error_message ?? 'Image generation failed. Please try again.';
        }

        return response()->json($data);
    }
}
