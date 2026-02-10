<?php

namespace App\Http\Controllers\Api\Apex;

use App\Http\Controllers\Controller;
use App\Models\ApexActivityLog;
use App\Models\ApexLinkedInAccount;
use App\Models\PortalAvailableAgent;
use App\Services\Apex\UnipileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LinkedInController extends Controller
{
    public function __construct(
        private UnipileService $unipileService
    ) {}

    /**
     * Get the user's LinkedIn accounts.
     */
    public function index(Request $request): JsonResponse
    {
        $accounts = ApexLinkedInAccount::query()
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['accounts' => $accounts]);
    }

    /**
     * Get the hosted auth URL to connect LinkedIn.
     */
    public function connect(Request $request): JsonResponse
    {
        $request->validate([
            'redirect_url' => ['required', 'url'],
            'agent_id' => ['required', 'string', 'exists:portal_available_agents,id'],
        ]);

        $agent = PortalAvailableAgent::findOrFail($request->agent_id);

        $this->unipileService->forAgent($agent);

        if (! $this->unipileService->isConfigured()) {
            return response()->json([
                'error' => 'LinkedIn integration is not configured for this agent.',
            ], 422);
        }

        $result = $this->unipileService->getHostedAuthUrl($request->redirect_url);

        if (! $result) {
            return response()->json([
                'error' => 'Failed to generate LinkedIn auth URL.',
            ], 500);
        }

        return response()->json([
            'auth_url' => $result['url'],
            'account_id' => $result['account_id'],
        ]);
    }

    /**
     * Connect a LinkedIn account using credentials.
     */
    public function connectWithCredentials(Request $request): JsonResponse
    {
        $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
            'agent_id' => ['required', 'string', 'exists:portal_available_agents,id'],
        ]);

        $agent = PortalAvailableAgent::findOrFail($request->agent_id);
        $this->unipileService->forAgent($agent);

        if (! $this->unipileService->isConfigured()) {
            return response()->json([
                'error' => 'LinkedIn integration is not configured for this agent.',
            ], 422);
        }

        $result = $this->unipileService->connectWithCredentials(
            $request->username,
            $request->password
        );

        if (! $result || ! $result['account_id']) {
            return response()->json([
                'error' => 'Failed to connect LinkedIn account. Please check your credentials.',
            ], 422);
        }

        $user = $request->user();

        // Create or update the LinkedIn account record
        $linkedInAccount = ApexLinkedInAccount::updateOrCreate(
            [
                'user_id' => $user->id,
                'unipile_account_id' => $result['account_id'],
            ],
            [
                'status' => $this->mapUnipileStatus($result['status']),
                'checkpoint_type' => $result['checkpoint_type'],
                'last_synced_at' => now(),
            ]
        );

        // Log the activity
        ApexActivityLog::log(
            $user,
            'linkedin_connected',
            'LinkedIn account connection initiated'
        );

        return response()->json([
            'account' => $linkedInAccount,
            'requires_checkpoint' => $linkedInAccount->requiresCheckpoint(),
            'checkpoint_type' => $result['checkpoint_type'],
        ]);
    }

    /**
     * Handle the callback after LinkedIn auth completes.
     */
    public function callback(Request $request): JsonResponse
    {
        $request->validate([
            'account_id' => ['required', 'string'],
            'agent_id' => ['required', 'string', 'exists:portal_available_agents,id'],
        ]);

        $user = $request->user();
        $agent = PortalAvailableAgent::findOrFail($request->agent_id);

        $this->unipileService->forAgent($agent);

        if (! $this->unipileService->isConfigured()) {
            return response()->json([
                'error' => 'LinkedIn integration is not configured.',
            ], 422);
        }

        $status = $this->unipileService->getAccountStatus($request->account_id);

        if (! $status) {
            return response()->json([
                'error' => 'Failed to get account status.',
            ], 500);
        }

        // Create or update the LinkedIn account record
        $linkedInAccount = ApexLinkedInAccount::updateOrCreate(
            [
                'user_id' => $user->id,
                'unipile_account_id' => $request->account_id,
            ],
            [
                'linkedin_profile_id' => $status['profile']['id'],
                'linkedin_profile_url' => $status['profile']['profile_url'],
                'display_name' => $status['profile']['name'],
                'email' => $status['profile']['email'],
                'status' => $this->mapUnipileStatus($status['status']),
                'checkpoint_type' => $status['checkpoint_type'],
                'last_synced_at' => now(),
            ]
        );

        // Log the activity
        ApexActivityLog::log(
            $user,
            'linkedin_connected',
            "LinkedIn account connected: {$linkedInAccount->display_name}"
        );

        return response()->json([
            'account' => $linkedInAccount,
            'requires_checkpoint' => $linkedInAccount->requiresCheckpoint(),
        ]);
    }

    /**
     * Get account status.
     */
    public function status(Request $request, string $accountId): JsonResponse
    {
        $request->validate([
            'agent_id' => ['required', 'string', 'exists:portal_available_agents,id'],
        ]);

        $linkedInAccount = ApexLinkedInAccount::query()
            ->where('user_id', $request->user()->id)
            ->where('id', $accountId)
            ->firstOrFail();

        $agent = PortalAvailableAgent::findOrFail($request->agent_id);
        $this->unipileService->forAgent($agent);

        if (! $this->unipileService->isConfigured()) {
            return response()->json([
                'error' => 'LinkedIn integration is not configured.',
            ], 422);
        }

        $status = $this->unipileService->getAccountStatus($linkedInAccount->unipile_account_id);

        // Account no longer exists on Unipile — clean up the orphaned record
        if ($status && $status['status'] === 'not_found') {
            $linkedInAccount->delete();

            return response()->json([
                'account' => null,
                'unipile_status' => $status,
                'deleted' => true,
            ]);
        }

        if ($status) {
            $linkedInAccount->update([
                'status' => $this->mapUnipileStatus($status['status']),
                'checkpoint_type' => $status['checkpoint_type'],
                'last_synced_at' => now(),
            ]);
        }

        return response()->json([
            'account' => $linkedInAccount->fresh(),
            'unipile_status' => $status,
        ]);
    }

    /**
     * Solve a checkpoint.
     */
    public function solveCheckpoint(Request $request, string $accountId): JsonResponse
    {
        $request->validate([
            'code' => ['required', 'string'],
            'agent_id' => ['required', 'string', 'exists:portal_available_agents,id'],
        ]);

        $linkedInAccount = ApexLinkedInAccount::query()
            ->where('user_id', $request->user()->id)
            ->where('id', $accountId)
            ->firstOrFail();

        $agent = PortalAvailableAgent::findOrFail($request->agent_id);
        $this->unipileService->forAgent($agent);

        if (! $this->unipileService->isConfigured()) {
            return response()->json([
                'error' => 'LinkedIn integration is not configured.',
            ], 422);
        }

        $success = $this->unipileService->solveCheckpoint(
            $linkedInAccount->unipile_account_id,
            $request->code
        );

        if (! $success) {
            return response()->json([
                'error' => 'Failed to solve checkpoint. The code may be incorrect.',
            ], 422);
        }

        // Refresh the account status
        $status = $this->unipileService->getAccountStatus($linkedInAccount->unipile_account_id);
        if ($status) {
            $linkedInAccount->update([
                'status' => $this->mapUnipileStatus($status['status']),
                'checkpoint_type' => $status['checkpoint_type'],
                'last_synced_at' => now(),
            ]);
        }

        return response()->json([
            'success' => true,
            'account' => $linkedInAccount->fresh(),
        ]);
    }

    /**
     * Disconnect a LinkedIn account.
     */
    public function disconnect(Request $request, string $accountId): JsonResponse
    {
        $request->validate([
            'agent_id' => ['required', 'string', 'exists:portal_available_agents,id'],
        ]);

        $linkedInAccount = ApexLinkedInAccount::query()
            ->where('user_id', $request->user()->id)
            ->where('id', $accountId)
            ->firstOrFail();

        $agent = PortalAvailableAgent::findOrFail($request->agent_id);
        $this->unipileService->forAgent($agent);

        if ($this->unipileService->isConfigured()) {
            $this->unipileService->disconnectAccount($linkedInAccount->unipile_account_id);
        }

        // Log the activity before deleting
        ApexActivityLog::log(
            $request->user(),
            'linkedin_disconnected',
            "LinkedIn account disconnected: {$linkedInAccount->display_name}"
        );

        $linkedInAccount->delete();

        return response()->json(['success' => true]);
    }

    /**
     * Get LinkedIn chats for the user's connected account.
     */
    public function chats(Request $request): JsonResponse
    {
        $request->validate([
            'agent_id' => ['required', 'string', 'exists:portal_available_agents,id'],
            'limit' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'cursor' => ['sometimes', 'string'],
        ]);

        $linkedInAccount = ApexLinkedInAccount::query()
            ->where('user_id', $request->user()->id)
            ->active()
            ->latest()
            ->first();

        if (! $linkedInAccount) {
            return response()->json([
                'error' => 'No active LinkedIn account found.',
            ], 422);
        }

        $agent = PortalAvailableAgent::findOrFail($request->agent_id);
        $this->unipileService->forAgent($agent);

        if (! $this->unipileService->isConfigured()) {
            return response()->json([
                'error' => 'LinkedIn integration is not configured.',
            ], 422);
        }

        $chats = $this->unipileService->getChats(
            $linkedInAccount->unipile_account_id,
            $request->get('limit', 50),
            $request->get('cursor')
        );

        // Fetch attendees to enrich chats with names and pictures
        $attendees = $this->unipileService->getChatAttendees(
            $linkedInAccount->unipile_account_id,
            100
        );

        // Build lookup: provider_id → attendee
        $attendeeMap = $attendees->keyBy('provider_id');

        // Transform chats into a clean, enriched format
        $enrichedChats = $chats->map(function (array $chat) use ($attendeeMap) {
            $attendee = $attendeeMap->get($chat['attendee_provider_id'] ?? '');

            return [
                'id' => $chat['id'],
                'name' => $attendee['name'] ?? $chat['name'] ?? null,
                'picture_url' => $attendee['picture_url'] ?? null,
                'profile_url' => $attendee['profile_url'] ?? null,
                'occupation' => $attendee['specifics']['occupation'] ?? null,
                'timestamp' => $chat['timestamp'] ?? null,
                'unread_count' => $chat['unread_count'] ?? 0,
                'content_type' => $chat['content_type'] ?? null,
                'read_only' => (bool) ($chat['read_only'] ?? false),
                'subject' => $chat['subject'] ?? null,
            ];
        });

        return response()->json(['chats' => $enrichedChats->values()]);
    }

    /**
     * Get messages for a specific LinkedIn chat.
     */
    public function chatMessages(Request $request, string $chatId): JsonResponse
    {
        $request->validate([
            'agent_id' => ['required', 'string', 'exists:portal_available_agents,id'],
            'limit' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'cursor' => ['sometimes', 'string'],
        ]);

        $linkedInAccount = ApexLinkedInAccount::query()
            ->where('user_id', $request->user()->id)
            ->active()
            ->latest()
            ->first();

        if (! $linkedInAccount) {
            return response()->json([
                'error' => 'No active LinkedIn account found.',
            ], 422);
        }

        $agent = PortalAvailableAgent::findOrFail($request->agent_id);
        $this->unipileService->forAgent($agent);

        if (! $this->unipileService->isConfigured()) {
            return response()->json([
                'error' => 'LinkedIn integration is not configured.',
            ], 422);
        }

        $messages = $this->unipileService->getChatMessages(
            $chatId,
            $request->get('limit', 50),
            $request->get('cursor')
        );

        // Transform messages into a clean format
        $cleanMessages = $messages->map(fn (array $msg) => [
            'id' => $msg['id'],
            'chat_id' => $msg['chat_id'],
            'sender_id' => $msg['sender_id'] ?? null,
            'text' => $msg['text'] ?? '',
            'timestamp' => $msg['timestamp'] ?? null,
            'is_sender' => (bool) ($msg['is_sender'] ?? false),
            'attachments' => $msg['attachments'] ?? [],
        ]);

        return response()->json(['messages' => $cleanMessages->values()]);
    }

    /**
     * Send a message to a LinkedIn chat.
     */
    public function sendChatMessage(Request $request, string $chatId): JsonResponse
    {
        $request->validate([
            'agent_id' => ['required', 'string', 'exists:portal_available_agents,id'],
            'text' => ['required', 'string', 'max:5000'],
        ]);

        $linkedInAccount = ApexLinkedInAccount::query()
            ->where('user_id', $request->user()->id)
            ->active()
            ->latest()
            ->first();

        if (! $linkedInAccount) {
            return response()->json([
                'error' => 'No active LinkedIn account found.',
            ], 422);
        }

        $agent = PortalAvailableAgent::findOrFail($request->agent_id);
        $this->unipileService->forAgent($agent);

        if (! $this->unipileService->isConfigured()) {
            return response()->json([
                'error' => 'LinkedIn integration is not configured.',
            ], 422);
        }

        $success = $this->unipileService->sendMessage($chatId, $request->text);

        if (! $success) {
            return response()->json([
                'error' => 'Failed to send message.',
            ], 500);
        }

        return response()->json(['success' => true]);
    }

    /**
     * Map Unipile status to our status enum.
     */
    private function mapUnipileStatus(string $status): string
    {
        return match (strtolower($status)) {
            'ok', 'connected', 'active' => 'active',
            'pending', 'connecting' => 'pending',
            'disconnected', 'error', 'failed' => 'disconnected',
            default => 'pending',
        };
    }
}
