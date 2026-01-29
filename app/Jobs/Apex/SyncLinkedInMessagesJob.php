<?php

namespace App\Jobs\Apex;

use App\Models\ApexActivityLog;
use App\Models\ApexCampaign;
use App\Models\ApexLinkedInAccount;
use App\Models\ApexProspect;
use App\Models\PortalAvailableAgent;
use App\Models\User;
use App\Services\Apex\UnipileService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class SyncLinkedInMessagesJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $backoff = 60;

    public function __construct(
        public User $user,
        public PortalAvailableAgent $agent
    ) {}

    public function handle(UnipileService $unipileService): void
    {
        // Get user's active LinkedIn account
        $linkedInAccount = ApexLinkedInAccount::query()
            ->where('user_id', $this->user->id)
            ->where('status', 'active')
            ->first();

        if (! $linkedInAccount) {
            Log::info("No active LinkedIn account for user {$this->user->id}, skipping sync.");

            return;
        }

        // Configure the Unipile service
        $unipileService->forAgent($this->agent);

        if (! $unipileService->isConfigured()) {
            Log::warning("UnipileService not configured for agent {$this->agent->id}");

            return;
        }

        // Get recent chats
        $chats = $unipileService->getChats($linkedInAccount->unipile_account_id, 50);

        $repliesProcessed = 0;
        $connectionsAccepted = 0;

        foreach ($chats as $chat) {
            $this->processChat($unipileService, $linkedInAccount, $chat, $repliesProcessed, $connectionsAccepted);
        }

        // Update the account's last sync time
        $linkedInAccount->update(['last_synced_at' => now()]);

        Log::info("LinkedIn sync completed for user {$this->user->id}. Replies: {$repliesProcessed}, Connections accepted: {$connectionsAccepted}");
    }

    /**
     * Process a single chat for new messages.
     */
    private function processChat(
        UnipileService $unipileService,
        ApexLinkedInAccount $linkedInAccount,
        array $chat,
        int &$repliesProcessed,
        int &$connectionsAccepted
    ): void {
        $chatId = $chat['id'] ?? null;
        if (! $chatId) {
            return;
        }

        // Find the prospect from chat attendees
        $attendees = $chat['attendees'] ?? [];
        $prospect = null;

        foreach ($attendees as $attendee) {
            $providerId = $attendee['provider_id'] ?? null;
            if ($providerId && $providerId !== $linkedInAccount->linkedin_profile_id) {
                $prospect = ApexProspect::query()
                    ->where('user_id', $this->user->id)
                    ->where('linkedin_profile_id', $providerId)
                    ->first();

                if ($prospect) {
                    break;
                }
            }
        }

        if (! $prospect) {
            // Not a tracked prospect
            return;
        }

        // Check if this is a newly accepted connection (they replied for first time)
        if ($prospect->connection_status === 'pending') {
            $prospect->update(['connection_status' => 'connected']);
            $connectionsAccepted++;

            // Update all campaign-prospect records
            $prospect->campaignProspects()
                ->where('status', 'connection_sent')
                ->update([
                    'status' => 'connection_accepted',
                    'connection_accepted_at' => now(),
                    'next_follow_up_at' => now()->addDays(3), // Schedule first follow-up
                ]);

            // Update campaign stats
            $campaigns = ApexCampaign::query()
                ->whereHas('campaignProspects', fn ($q) => $q->where('prospect_id', $prospect->id))
                ->get();

            foreach ($campaigns as $campaign) {
                $campaign->increment('connections_accepted');
            }

            ApexActivityLog::log(
                $this->user,
                'connection_accepted',
                "Connection accepted by {$prospect->display_name}",
                null,
                $prospect
            );
        }

        // Get recent messages to check for replies
        $messages = $unipileService->getChatMessages($chatId, 10);

        foreach ($messages as $message) {
            $this->processMessage($prospect, $message, $repliesProcessed);
        }
    }

    /**
     * Process a single message for reply detection.
     */
    private function processMessage(
        ApexProspect $prospect,
        array $message,
        int &$repliesProcessed
    ): void {
        $senderId = $message['sender_id'] ?? null;
        $messageTime = $message['timestamp'] ?? null;

        // Skip if message is from us (not a reply)
        if ($senderId === $prospect->linkedin_profile_id) {
            return;
        }

        // Check if this is a recent message we haven't processed
        $lastReplyAt = $prospect->campaignProspects()
            ->max('last_reply_at');

        if ($messageTime && $lastReplyAt) {
            $messageDateTime = \Carbon\Carbon::parse($messageTime);
            $lastReplyDateTime = \Carbon\Carbon::parse($lastReplyAt);

            if ($messageDateTime->lte($lastReplyDateTime)) {
                // Already processed this message
                return;
            }
        }

        // Update campaign-prospect records
        $prospect->campaignProspects()
            ->whereIn('status', ['connection_accepted', 'message_sent'])
            ->update([
                'status' => 'replied',
                'last_reply_at' => now(),
                'next_follow_up_at' => null, // Stop follow-ups when they reply
            ]);

        // Update campaign stats
        $campaigns = ApexCampaign::query()
            ->whereHas('campaignProspects', fn ($q) => $q->where('prospect_id', $prospect->id))
            ->get();

        foreach ($campaigns as $campaign) {
            $campaign->increment('replies_received');
        }

        $repliesProcessed++;

        ApexActivityLog::log(
            $this->user,
            'reply_received',
            "Reply received from {$prospect->display_name}",
            null,
            $prospect,
            ['message_preview' => substr($message['text'] ?? '', 0, 100)]
        );
    }
}
