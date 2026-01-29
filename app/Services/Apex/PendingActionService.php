<?php

namespace App\Services\Apex;

use App\Models\ApexActivityLog;
use App\Models\ApexCampaignProspect;
use App\Models\ApexLinkedInAccount;
use App\Models\ApexPendingAction;
use App\Models\PortalAvailableAgent;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class PendingActionService
{
    public function __construct(
        private UnipileService $unipileService
    ) {}

    /**
     * Get pending actions for a user.
     *
     * @return Collection<int, ApexPendingAction>
     */
    public function getPendingActions(User $user, int $limit = 50): Collection
    {
        return ApexPendingAction::query()
            ->where('user_id', $user->id)
            ->pending()
            ->notExpired()
            ->with(['campaign', 'prospect'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Approve a single pending action.
     */
    public function approve(ApexPendingAction $action, PortalAvailableAgent $agent): bool
    {
        if (! $action->isPending() || $action->isExpired()) {
            return false;
        }

        $action->approve();

        // Execute the action immediately
        return $this->executeAction($action, $agent);
    }

    /**
     * Approve multiple pending actions.
     */
    public function approveMultiple(Collection $actions, PortalAvailableAgent $agent): array
    {
        $results = [
            'approved' => 0,
            'executed' => 0,
            'failed' => 0,
        ];

        foreach ($actions as $action) {
            if (! $action->isPending() || $action->isExpired()) {
                $results['failed']++;

                continue;
            }

            $action->approve();
            $results['approved']++;

            if ($this->executeAction($action, $agent)) {
                $results['executed']++;
            } else {
                $results['failed']++;
            }
        }

        return $results;
    }

    /**
     * Deny a single pending action.
     */
    public function deny(ApexPendingAction $action): bool
    {
        if (! $action->isPending()) {
            return false;
        }

        $action->deny();

        ApexActivityLog::log(
            $action->user,
            'action_denied',
            "Action denied: {$action->action_type}",
            $action->campaign,
            $action->prospect
        );

        return true;
    }

    /**
     * Deny multiple pending actions.
     */
    public function denyMultiple(Collection $actions): int
    {
        $denied = 0;

        foreach ($actions as $action) {
            if ($this->deny($action)) {
                $denied++;
            }
        }

        return $denied;
    }

    /**
     * Expire old pending actions.
     */
    public function expireOldActions(): int
    {
        return ApexPendingAction::query()
            ->where('status', 'pending')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<', now())
            ->update(['status' => 'expired']);
    }

    /**
     * Execute an approved action.
     */
    private function executeAction(ApexPendingAction $action, PortalAvailableAgent $agent): bool
    {
        $user = $action->user;

        // Get user's LinkedIn account
        $linkedInAccount = ApexLinkedInAccount::query()
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->first();

        if (! $linkedInAccount) {
            Log::warning("No active LinkedIn account for user {$user->id}, cannot execute action {$action->id}");

            return false;
        }

        // Configure Unipile service
        $this->unipileService->forAgent($agent);

        if (! $this->unipileService->isConfigured()) {
            Log::warning("UnipileService not configured for agent {$agent->id}");

            return false;
        }

        $success = match ($action->action_type) {
            'send_connection' => $this->executeConnectionRequest($action, $linkedInAccount),
            'send_message', 'send_follow_up' => $this->executeMessage($action, $linkedInAccount),
            default => false,
        };

        if ($success) {
            $action->markExecuted();
        }

        return $success;
    }

    /**
     * Execute a connection request action.
     */
    private function executeConnectionRequest(ApexPendingAction $action, ApexLinkedInAccount $linkedInAccount): bool
    {
        $prospect = $action->prospect;

        if (! $prospect || ! $prospect->linkedin_profile_url) {
            return false;
        }

        $success = $this->unipileService->sendConnectionRequest(
            $linkedInAccount->unipile_account_id,
            $prospect->linkedin_profile_url,
            $action->message_content
        );

        if ($success) {
            // Update prospect status
            $prospect->update(['connection_status' => 'pending']);

            // Update campaign-prospect record if exists
            if ($action->campaign_id) {
                ApexCampaignProspect::query()
                    ->where('campaign_id', $action->campaign_id)
                    ->where('prospect_id', $prospect->id)
                    ->update([
                        'status' => 'connection_sent',
                        'connection_sent_at' => now(),
                    ]);

                // Update campaign stats
                $action->campaign?->increment('connections_sent');
            }

            ApexActivityLog::log(
                $action->user,
                'connection_sent',
                "Connection request sent to {$prospect->display_name} (via approved action)",
                $action->campaign,
                $prospect
            );
        }

        return $success;
    }

    /**
     * Execute a message/follow-up action.
     */
    private function executeMessage(ApexPendingAction $action, ApexLinkedInAccount $linkedInAccount): bool
    {
        $prospect = $action->prospect;

        if (! $prospect || ! $prospect->linkedin_profile_id) {
            return false;
        }

        // Try to find existing chat
        $chats = $this->unipileService->getChats($linkedInAccount->unipile_account_id, 50);
        $chatId = null;

        foreach ($chats as $chat) {
            $attendees = $chat['attendees'] ?? [];
            foreach ($attendees as $attendee) {
                if (($attendee['provider_id'] ?? '') === $prospect->linkedin_profile_id) {
                    $chatId = $chat['id'] ?? null;
                    break 2;
                }
            }
        }

        // If no chat exists, start one
        if (! $chatId) {
            $chatId = $this->unipileService->startChat(
                $linkedInAccount->unipile_account_id,
                $prospect->linkedin_profile_id,
                $action->message_content
            );

            // startChat already sends the message
            $success = $chatId !== null;
        } else {
            $success = $this->unipileService->sendMessage($chatId, $action->message_content);
        }

        if ($success) {
            // Update campaign-prospect record if exists
            if ($action->campaign_id) {
                $campaignProspect = ApexCampaignProspect::query()
                    ->where('campaign_id', $action->campaign_id)
                    ->where('prospect_id', $prospect->id)
                    ->first();

                if ($campaignProspect) {
                    $newFollowUpCount = $campaignProspect->follow_up_count + 1;
                    $campaign = $action->campaign;

                    // Calculate next follow-up time
                    $nextFollowUpAt = match ($newFollowUpCount) {
                        1 => $campaign?->follow_up_delay_days_2 ? now()->addDays($campaign->follow_up_delay_days_2) : null,
                        2 => $campaign?->follow_up_delay_days_3 ? now()->addDays($campaign->follow_up_delay_days_3) : null,
                        default => null,
                    };

                    $campaignProspect->update([
                        'status' => 'message_sent',
                        'last_message_sent_at' => now(),
                        'follow_up_count' => $newFollowUpCount,
                        'next_follow_up_at' => $nextFollowUpAt,
                    ]);
                }

                // Update campaign stats
                $action->campaign?->increment('messages_sent');
            }

            $activityType = $action->action_type === 'send_follow_up' ? 'follow_up_sent' : 'message_sent';
            ApexActivityLog::log(
                $action->user,
                $activityType,
                "Message sent to {$prospect->display_name} (via approved action)",
                $action->campaign,
                $prospect
            );
        }

        return $success;
    }
}
