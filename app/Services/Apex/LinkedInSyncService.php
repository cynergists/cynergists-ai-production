<?php

namespace App\Services\Apex;

use App\Models\ApexActivityLog;
use App\Models\ApexCampaign;
use App\Models\ApexLinkedInAccount;
use App\Models\ApexProspect;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class LinkedInSyncService
{
    /**
     * Sync LinkedIn messages to detect replies and accepted connections.
     */
    public function sync(UnipileService $unipileService, ApexLinkedInAccount $linkedInAccount, User $user): void
    {
        $chats = $unipileService->getChats($linkedInAccount->unipile_account_id, 50);

        $repliesProcessed = 0;
        $connectionsAccepted = 0;

        foreach ($chats as $chat) {
            $this->processChat($unipileService, $linkedInAccount, $user, $chat, $repliesProcessed, $connectionsAccepted);
        }

        $linkedInAccount->update(['last_synced_at' => now()]);

        if ($repliesProcessed > 0 || $connectionsAccepted > 0) {
            Log::info("LinkedIn sync completed for user {$user->id}. Replies: {$repliesProcessed}, Connections accepted: {$connectionsAccepted}");
        }
    }

    private function processChat(
        UnipileService $unipileService,
        ApexLinkedInAccount $linkedInAccount,
        User $user,
        array $chat,
        int &$repliesProcessed,
        int &$connectionsAccepted
    ): void {
        $chatId = $chat['id'] ?? null;
        if (! $chatId) {
            return;
        }

        $attendees = $chat['attendees'] ?? [];
        $prospect = null;

        foreach ($attendees as $attendee) {
            $providerId = $attendee['provider_id'] ?? null;
            if ($providerId && $providerId !== $linkedInAccount->linkedin_profile_id) {
                $prospect = ApexProspect::query()
                    ->where('user_id', $user->id)
                    ->where('linkedin_profile_id', $providerId)
                    ->first();

                if ($prospect) {
                    break;
                }
            }
        }

        if (! $prospect) {
            return;
        }

        if ($prospect->connection_status === 'pending') {
            $prospect->update(['connection_status' => 'connected']);
            $connectionsAccepted++;

            $prospect->campaignProspects()
                ->where('status', 'connection_sent')
                ->update([
                    'status' => 'connection_accepted',
                    'connection_accepted_at' => now(),
                    'next_follow_up_at' => now()->addDays(3),
                ]);

            $campaigns = ApexCampaign::query()
                ->whereHas('campaignProspects', fn ($q) => $q->where('prospect_id', $prospect->id))
                ->get();

            foreach ($campaigns as $campaign) {
                $campaign->increment('connections_accepted');
            }

            ApexActivityLog::log(
                $user,
                'connection_accepted',
                "Connection accepted by {$prospect->display_name}",
                null,
                $prospect
            );
        }

        $messages = $unipileService->getChatMessages($chatId, 10);

        foreach ($messages as $message) {
            $this->processMessage($prospect, $user, $message, $repliesProcessed);
        }
    }

    private function processMessage(
        ApexProspect $prospect,
        User $user,
        array $message,
        int &$repliesProcessed
    ): void {
        $senderId = $message['sender_id'] ?? null;
        $messageTime = $message['timestamp'] ?? null;

        if ($senderId === $prospect->linkedin_profile_id) {
            return;
        }

        $lastReplyAt = $prospect->campaignProspects()
            ->max('last_reply_at');

        if ($messageTime && $lastReplyAt) {
            $messageDateTime = Carbon::parse($messageTime);
            $lastReplyDateTime = Carbon::parse($lastReplyAt);

            if ($messageDateTime->lte($lastReplyDateTime)) {
                return;
            }
        }

        $prospect->campaignProspects()
            ->whereIn('status', ['connection_accepted', 'message_sent'])
            ->update([
                'status' => 'replied',
                'last_reply_at' => now(),
                'next_follow_up_at' => null,
            ]);

        $campaigns = ApexCampaign::query()
            ->whereHas('campaignProspects', fn ($q) => $q->where('prospect_id', $prospect->id))
            ->get();

        foreach ($campaigns as $campaign) {
            $campaign->increment('replies_received');
        }

        $repliesProcessed++;

        ApexActivityLog::log(
            $user,
            'reply_received',
            "Reply received from {$prospect->display_name}",
            null,
            $prospect,
            ['message_preview' => substr($message['text'] ?? '', 0, 100)]
        );
    }
}
