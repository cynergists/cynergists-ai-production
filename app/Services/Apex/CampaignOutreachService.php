<?php

namespace App\Services\Apex;

use App\Models\ApexActivityLog;
use App\Models\ApexCampaign;
use App\Models\ApexCampaignProspect;
use App\Models\ApexLinkedInAccount;
use App\Models\ApexPendingAction;
use App\Models\ApexUserSettings;
use Illuminate\Support\Facades\Log;

class CampaignOutreachService
{
    /**
     * Send connection requests to queued prospects.
     */
    public function sendConnections(
        UnipileService $unipileService,
        ApexLinkedInAccount $linkedInAccount,
        ApexCampaign $campaign,
        ApexUserSettings $settings
    ): void {
        $queuedProspects = ApexCampaignProspect::query()
            ->where('campaign_id', $campaign->id)
            ->where('status', 'queued')
            ->with('prospect')
            ->limit($campaign->daily_connection_limit)
            ->get();

        $connectionsSentToday = ApexCampaignProspect::query()
            ->where('campaign_id', $campaign->id)
            ->whereDate('connection_sent_at', today())
            ->count();

        foreach ($queuedProspects as $campaignProspect) {
            if ($connectionsSentToday >= $campaign->daily_connection_limit) {
                Log::info("Daily connection limit reached for campaign {$campaign->id}");
                break;
            }

            $prospect = $campaignProspect->prospect;

            if (! $prospect->linkedin_profile_id) {
                Log::warning("Prospect {$prospect->id} has no LinkedIn profile ID, marking as failed");
                $campaignProspect->update(['status' => 'failed']);

                continue;
            }

            if ($settings->autopilot_enabled) {
                $success = $unipileService->sendConnectionRequest(
                    $linkedInAccount->unipile_account_id,
                    $prospect->linkedin_profile_id,
                    $campaign->connection_message
                );

                if ($success) {
                    $campaignProspect->update([
                        'status' => 'connection_sent',
                        'connection_sent_at' => now(),
                    ]);

                    $prospect->update(['connection_status' => 'pending']);
                    $campaign->increment('connections_sent');

                    ApexActivityLog::log(
                        $campaign->user,
                        'connection_sent',
                        "Connection request sent to {$prospect->display_name}",
                        $campaign,
                        $prospect
                    );

                    $connectionsSentToday++;
                } else {
                    $campaignProspect->update(['status' => 'failed']);
                    Log::warning("Failed to send connection to prospect {$prospect->id}, marked as failed");
                }
            } else {
                ApexPendingAction::create([
                    'user_id' => $campaign->user_id,
                    'campaign_id' => $campaign->id,
                    'prospect_id' => $campaignProspect->prospect_id,
                    'action_type' => 'send_connection',
                    'status' => 'pending',
                    'message_content' => $campaign->connection_message,
                    'expires_at' => now()->addDays(7),
                    'metadata' => [
                        'campaign_name' => $campaign->name,
                        'prospect_name' => $campaignProspect->prospect->display_name,
                    ],
                ]);
            }
        }

        Log::info("Pipeline: Connections for campaign {$campaign->id} completed. Processed {$queuedProspects->count()} prospects.");
    }

    /**
     * Process follow-up messages for prospects ready for follow-up.
     */
    public function processFollowUps(
        UnipileService $unipileService,
        ApexLinkedInAccount $linkedInAccount,
        ApexCampaign $campaign,
        ApexUserSettings $settings
    ): void {
        $prospectsForFollowUp = ApexCampaignProspect::query()
            ->where('campaign_id', $campaign->id)
            ->readyForFollowUp()
            ->with('prospect')
            ->limit($campaign->daily_message_limit)
            ->get();

        $messagesSentToday = ApexCampaignProspect::query()
            ->where('campaign_id', $campaign->id)
            ->whereDate('last_message_sent_at', today())
            ->count();

        foreach ($prospectsForFollowUp as $campaignProspect) {
            if ($messagesSentToday >= $campaign->daily_message_limit) {
                Log::info("Daily message limit reached for campaign {$campaign->id}");
                break;
            }

            $followUpMessage = $this->getFollowUpMessage($campaign, $campaignProspect);

            if (! $followUpMessage) {
                $campaignProspect->update(['next_follow_up_at' => null]);

                continue;
            }

            if ($settings->autopilot_enabled) {
                $this->sendFollowUp(
                    $unipileService,
                    $linkedInAccount,
                    $campaignProspect,
                    $campaign,
                    $followUpMessage
                );
                $messagesSentToday++;
            } else {
                ApexPendingAction::create([
                    'user_id' => $campaign->user_id,
                    'campaign_id' => $campaign->id,
                    'prospect_id' => $campaignProspect->prospect_id,
                    'action_type' => 'send_follow_up',
                    'status' => 'pending',
                    'message_content' => $followUpMessage,
                    'expires_at' => now()->addDays(7),
                    'metadata' => [
                        'campaign_name' => $campaign->name,
                        'prospect_name' => $campaignProspect->prospect->display_name,
                        'follow_up_number' => $campaignProspect->follow_up_count + 1,
                    ],
                ]);
            }
        }

        Log::info("Pipeline: Follow-ups for campaign {$campaign->id} completed. Processed {$prospectsForFollowUp->count()} prospects.");
    }

    private function getFollowUpMessage(ApexCampaign $campaign, ApexCampaignProspect $campaignProspect): ?string
    {
        return match ($campaignProspect->follow_up_count) {
            0 => $campaign->follow_up_message_1,
            1 => $campaign->follow_up_message_2,
            2 => $campaign->follow_up_message_3,
            default => null,
        };
    }

    private function getNextFollowUpDelay(ApexCampaign $campaign, int $currentCount): ?int
    {
        return match ($currentCount + 1) {
            1 => $campaign->follow_up_delay_days_2,
            2 => $campaign->follow_up_delay_days_3,
            default => null,
        };
    }

    private function sendFollowUp(
        UnipileService $unipileService,
        ApexLinkedInAccount $linkedInAccount,
        ApexCampaignProspect $campaignProspect,
        ApexCampaign $campaign,
        string $message
    ): void {
        $prospect = $campaignProspect->prospect;

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

    private function findOrCreateChat(
        UnipileService $unipileService,
        ApexLinkedInAccount $linkedInAccount,
        ?string $profileId,
        string $message
    ): ?string {
        if (! $profileId) {
            return null;
        }

        $chats = $unipileService->getChats($linkedInAccount->unipile_account_id, 50);

        foreach ($chats as $chat) {
            $attendees = $chat['attendees'] ?? [];
            foreach ($attendees as $attendee) {
                if (($attendee['provider_id'] ?? '') === $profileId) {
                    return $chat['id'] ?? null;
                }
            }
        }

        return $unipileService->startChat(
            $linkedInAccount->unipile_account_id,
            $profileId,
            $message
        );
    }
}
