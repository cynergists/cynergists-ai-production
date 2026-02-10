<?php

namespace App\Jobs\Apex;

use App\Models\ApexActivityLog;
use App\Models\ApexCampaign;
use App\Models\ApexCampaignProspect;
use App\Models\ApexLinkedInAccount;
use App\Models\ApexPendingAction;
use App\Models\ApexUserSettings;
use App\Models\PortalAvailableAgent;
use App\Services\Apex\UnipileService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class ProcessFollowUpsJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $backoff = 60;

    public function __construct(
        public ApexCampaign $campaign,
        public PortalAvailableAgent $agent
    ) {}

    public function handle(UnipileService $unipileService): void
    {
        $campaign = $this->campaign->fresh();

        // Verify campaign is still active
        if ($campaign->status !== 'active') {
            Log::info("Campaign {$campaign->id} is no longer active, skipping follow-ups.");

            return;
        }

        $user = $campaign->user;

        // Get user's LinkedIn account
        $linkedInAccount = ApexLinkedInAccount::query()
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->first();

        if (! $linkedInAccount) {
            Log::warning("No active LinkedIn account for user {$user->id}, skipping follow-ups");

            return;
        }

        // Get user settings
        $settings = ApexUserSettings::forUser($user);

        // Configure the Unipile service
        $unipileService->forAgent($this->agent);

        if (! $unipileService->isConfigured()) {
            Log::warning("UnipileService not configured for agent {$this->agent->id}");

            return;
        }

        // Get prospects ready for follow-up
        $prospectsForFollowUp = ApexCampaignProspect::query()
            ->where('campaign_id', $campaign->id)
            ->readyForFollowUp()
            ->with('prospect')
            ->limit($campaign->daily_message_limit)
            ->get();

        $messagesSentToday = $this->getMessagesSentToday($campaign);

        foreach ($prospectsForFollowUp as $campaignProspect) {
            // Check daily limit
            if ($messagesSentToday >= $campaign->daily_message_limit) {
                Log::info("Daily message limit reached for campaign {$campaign->id}");
                break;
            }

            // Determine which follow-up message to send
            $followUpMessage = $this->getFollowUpMessage($campaign, $campaignProspect);

            if (! $followUpMessage) {
                // All follow-ups sent, skip
                Log::info("All follow-ups sent for prospect {$campaignProspect->prospect_id}");
                $campaignProspect->update(['next_follow_up_at' => null]);

                continue;
            }

            if ($settings->autopilot_enabled) {
                // Autopilot mode: send message directly
                $this->sendFollowUp(
                    $unipileService,
                    $linkedInAccount,
                    $campaignProspect,
                    $campaign,
                    $followUpMessage
                );
                $messagesSentToday++;
            } else {
                // Manual mode: create pending action
                $this->createPendingAction($campaignProspect, $campaign, $followUpMessage);
            }
        }

        Log::info("Follow-up job for campaign {$campaign->id} completed. Processed {$prospectsForFollowUp->count()} prospects.");

        $campaign->fresh()->autoCompleteIfDone();
    }

    /**
     * Get the appropriate follow-up message based on follow-up count.
     */
    private function getFollowUpMessage(ApexCampaign $campaign, ApexCampaignProspect $campaignProspect): ?string
    {
        $count = $campaignProspect->follow_up_count;

        return match ($count) {
            0 => $campaign->follow_up_message_1,
            1 => $campaign->follow_up_message_2,
            2 => $campaign->follow_up_message_3,
            default => null,
        };
    }

    /**
     * Get the next follow-up delay based on follow-up count.
     */
    private function getNextFollowUpDelay(ApexCampaign $campaign, int $currentCount): ?int
    {
        return match ($currentCount + 1) {
            1 => $campaign->follow_up_delay_days_2,
            2 => $campaign->follow_up_delay_days_3,
            default => null,
        };
    }

    /**
     * Send a follow-up message.
     */
    private function sendFollowUp(
        UnipileService $unipileService,
        ApexLinkedInAccount $linkedInAccount,
        ApexCampaignProspect $campaignProspect,
        ApexCampaign $campaign,
        string $message
    ): void {
        $prospect = $campaignProspect->prospect;

        // Try to find existing chat or start new one
        $chatId = $this->findOrCreateChat(
            $unipileService,
            $linkedInAccount,
            $prospect->linkedin_profile_id,
            $message
        );

        if (! $chatId) {
            Log::warning("Failed to find or create chat for prospect {$prospect->id}");

            return;
        }

        $success = $unipileService->sendMessage($chatId, $message);

        if ($success) {
            $newFollowUpCount = $campaignProspect->follow_up_count + 1;
            $nextDelay = $this->getNextFollowUpDelay($campaign, $campaignProspect->follow_up_count);

            $campaignProspect->update([
                'status' => 'message_sent',
                'last_message_sent_at' => now(),
                'follow_up_count' => $newFollowUpCount,
                'next_follow_up_at' => $nextDelay ? now()->addDays($nextDelay) : null,
            ]);

            $campaign->increment('messages_sent');

            ApexActivityLog::log(
                $campaign->user,
                'follow_up_sent',
                "Follow-up #{$newFollowUpCount} sent to {$prospect->display_name}",
                $campaign,
                $prospect
            );
        } else {
            Log::warning("Failed to send follow-up to prospect {$prospect->id}");
        }
    }

    /**
     * Find an existing chat or create a new one.
     */
    private function findOrCreateChat(
        UnipileService $unipileService,
        ApexLinkedInAccount $linkedInAccount,
        ?string $profileId,
        string $message
    ): ?string {
        if (! $profileId) {
            return null;
        }

        // First, try to find existing chat
        $chats = $unipileService->getChats($linkedInAccount->unipile_account_id, 50);

        foreach ($chats as $chat) {
            $attendees = $chat['attendees'] ?? [];
            foreach ($attendees as $attendee) {
                if (($attendee['provider_id'] ?? '') === $profileId) {
                    return $chat['id'] ?? null;
                }
            }
        }

        // No existing chat, start a new one
        return $unipileService->startChat(
            $linkedInAccount->unipile_account_id,
            $profileId,
            $message
        );
    }

    /**
     * Create a pending action for manual approval.
     */
    private function createPendingAction(
        ApexCampaignProspect $campaignProspect,
        ApexCampaign $campaign,
        string $message
    ): void {
        ApexPendingAction::create([
            'user_id' => $campaign->user_id,
            'campaign_id' => $campaign->id,
            'prospect_id' => $campaignProspect->prospect_id,
            'action_type' => 'send_follow_up',
            'status' => 'pending',
            'message_content' => $message,
            'expires_at' => now()->addDays(7),
            'metadata' => [
                'campaign_name' => $campaign->name,
                'prospect_name' => $campaignProspect->prospect->display_name,
                'follow_up_number' => $campaignProspect->follow_up_count + 1,
            ],
        ]);
    }

    /**
     * Get the number of messages sent today for this campaign.
     */
    private function getMessagesSentToday(ApexCampaign $campaign): int
    {
        return ApexCampaignProspect::query()
            ->where('campaign_id', $campaign->id)
            ->whereDate('last_message_sent_at', today())
            ->count();
    }
}
