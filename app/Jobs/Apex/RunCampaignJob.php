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

class RunCampaignJob implements ShouldQueue
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
            Log::info("Campaign {$campaign->id} is no longer active, skipping.");

            return;
        }

        $user = $campaign->user;

        // Get user's LinkedIn account
        $linkedInAccount = ApexLinkedInAccount::query()
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->first();

        if (! $linkedInAccount) {
            Log::warning("No active LinkedIn account for user {$user->id}, skipping campaign {$campaign->id}");

            return;
        }

        // Get user settings to check autopilot mode
        $settings = ApexUserSettings::forUser($user);

        // Configure the Unipile service
        $unipileService->forAgent($this->agent);

        if (! $unipileService->isConfigured()) {
            Log::warning("UnipileService not configured for agent {$this->agent->id}");

            return;
        }

        // Get queued prospects for this campaign
        $queuedProspects = ApexCampaignProspect::query()
            ->where('campaign_id', $campaign->id)
            ->where('status', 'queued')
            ->with('prospect')
            ->limit($campaign->daily_connection_limit)
            ->get();

        $connectionsSentToday = $this->getConnectionsSentToday($campaign);

        foreach ($queuedProspects as $campaignProspect) {
            // Check daily limit
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
                // Autopilot mode: send connection directly
                $this->sendConnection(
                    $unipileService,
                    $linkedInAccount,
                    $campaignProspect,
                    $campaign
                );
                $connectionsSentToday++;
            } else {
                // Manual mode: create pending action for approval
                $this->createPendingAction($campaignProspect, $campaign);
            }
        }

        Log::info("Campaign {$campaign->id} job completed. Processed {$queuedProspects->count()} prospects.");

        $campaign->fresh()->autoCompleteIfDone();
    }

    /**
     * Send a connection request.
     */
    private function sendConnection(
        UnipileService $unipileService,
        ApexLinkedInAccount $linkedInAccount,
        ApexCampaignProspect $campaignProspect,
        ApexCampaign $campaign
    ): void {
        $prospect = $campaignProspect->prospect;

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

            $prospect->update([
                'connection_status' => 'pending',
            ]);

            $campaign->increment('connections_sent');

            ApexActivityLog::log(
                $campaign->user,
                'connection_sent',
                "Connection request sent to {$prospect->display_name}",
                $campaign,
                $prospect
            );
        } else {
            $campaignProspect->update(['status' => 'failed']);
            Log::warning("Failed to send connection to prospect {$prospect->id}, marked as failed");
        }
    }

    /**
     * Create a pending action for manual approval.
     */
    private function createPendingAction(
        ApexCampaignProspect $campaignProspect,
        ApexCampaign $campaign
    ): void {
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

    /**
     * Get the number of connections sent today for this campaign.
     */
    private function getConnectionsSentToday(ApexCampaign $campaign): int
    {
        return ApexCampaignProspect::query()
            ->where('campaign_id', $campaign->id)
            ->whereDate('connection_sent_at', today())
            ->count();
    }
}
