<?php

namespace App\Jobs\Apex;

use App\Models\ApexCampaign;
use App\Models\ApexLinkedInAccount;
use App\Models\ApexUserSettings;
use App\Models\PortalAvailableAgent;
use App\Services\Apex\CampaignOutreachService;
use App\Services\Apex\LinkedInSyncService;
use App\Services\Apex\ProspectDiscoveryService;
use App\Services\Apex\UnipileService;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\Middleware\WithoutOverlapping;
use Illuminate\Support\Facades\Log;

class RunCampaignPipelineJob implements ShouldBeUnique, ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $backoff = 60;

    public int $timeout = 300;

    public int $uniqueFor = 600;

    public function __construct(
        public ApexCampaign $campaign,
        public PortalAvailableAgent $agent
    ) {}

    public function uniqueId(): string
    {
        return 'apex-pipeline-'.$this->campaign->id;
    }

    /**
     * @return array<int, object>
     */
    public function middleware(): array
    {
        return [
            (new WithoutOverlapping('apex-pipeline-'.$this->campaign->id))
                ->dontRelease()
                ->expireAfter(360),
        ];
    }

    public function handle(
        UnipileService $unipileService,
        LinkedInSyncService $syncService,
        ProspectDiscoveryService $discoveryService,
        CampaignOutreachService $outreachService
    ): void {
        $campaign = $this->campaign->fresh();

        if ($campaign->status !== 'active') {
            Log::info("Campaign {$campaign->id} is no longer active, skipping pipeline.");

            return;
        }

        $user = $campaign->user;

        $linkedInAccount = ApexLinkedInAccount::query()
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->first();

        if (! $linkedInAccount) {
            Log::warning("No active LinkedIn account for user {$user->id}, skipping campaign {$campaign->id}");

            return;
        }

        $unipileService->forAgent($this->agent);

        if (! $unipileService->isConfigured()) {
            Log::warning("UnipileService not configured for agent {$this->agent->id}");

            return;
        }

        $settings = ApexUserSettings::forUser($user);

        // Step 0: Sync LinkedIn messages to detect replies and accepted connections
        try {
            $syncService->sync($unipileService, $linkedInAccount, $user);
        } catch (\Throwable $e) {
            Log::error("Pipeline sync failed for campaign {$campaign->id}", ['error' => $e->getMessage()]);
        }

        $campaign = $campaign->fresh();

        if ($campaign->status !== 'active') {
            return;
        }

        // Step 1: Discover new prospects
        try {
            $discoveryService->discover($unipileService, $linkedInAccount, $campaign);
        } catch (\Throwable $e) {
            Log::error("Pipeline discovery failed for campaign {$campaign->id}", ['error' => $e->getMessage()]);
        }

        $campaign = $campaign->fresh();

        if ($campaign->status !== 'active') {
            return;
        }

        // Step 2: Send connection requests
        try {
            $outreachService->sendConnections($unipileService, $linkedInAccount, $campaign, $settings);
        } catch (\Throwable $e) {
            Log::error("Pipeline connections failed for campaign {$campaign->id}", ['error' => $e->getMessage()]);
        }

        // Step 3: Process follow-ups
        try {
            $outreachService->processFollowUps($unipileService, $linkedInAccount, $campaign, $settings);
        } catch (\Throwable $e) {
            Log::error("Pipeline follow-ups failed for campaign {$campaign->id}", ['error' => $e->getMessage()]);
        }

        // Step 4: Check if campaign is done
        $campaign->fresh()->autoCompleteIfDone();
    }
}
