<?php

namespace App\Console\Commands;

use App\Jobs\Apex\DiscoverProspectsJob;
use App\Jobs\Apex\ProcessFollowUpsJob;
use App\Jobs\Apex\RunCampaignJob;
use App\Jobs\Apex\SyncLinkedInMessagesJob;
use App\Models\ApexCampaign;
use App\Models\PortalAvailableAgent;
use App\Services\Apex\PendingActionService;
use Illuminate\Console\Command;

class RunApexCampaignsCommand extends Command
{
    protected $signature = 'apex:run-campaigns';

    protected $description = 'Orchestrate daily Apex campaign execution: sync messages, discover prospects, send connections, and process follow-ups.';

    public function handle(PendingActionService $pendingActionService): int
    {
        $agent = PortalAvailableAgent::query()
            ->where('name', 'Apex')
            ->first();

        if (! $agent) {
            $this->error('Apex agent not found.');

            return self::FAILURE;
        }

        // Expire stale pending actions before processing campaigns
        $expired = $pendingActionService->expireOldActions();
        if ($expired > 0) {
            $this->info("Expired {$expired} stale pending actions.");
        }

        $campaigns = ApexCampaign::active()
            ->with('user')
            ->get();

        if ($campaigns->isEmpty()) {
            $this->info('No active campaigns found.');

            return self::SUCCESS;
        }

        $this->info("Processing {$campaigns->count()} active campaign(s)...");

        $userDelayOffset = 0;

        foreach ($campaigns as $campaign) {
            $userId = $campaign->user_id;

            // Stagger delays per campaign for human-like pacing
            $syncDelay = $userDelayOffset;
            $discoverDelay = $userDelayOffset + rand(2, 5);
            $connectionDelay = $userDelayOffset + rand(8, 15);
            $followUpDelay = $userDelayOffset + rand(20, 30);

            // 1. Sync LinkedIn messages first — detect replies and connection acceptances
            SyncLinkedInMessagesJob::dispatch($campaign->user, $agent)
                ->delay(now()->addMinutes($syncDelay));

            // 2. Discover new prospects matching campaign targeting
            DiscoverProspectsJob::dispatch($campaign, $agent)
                ->delay(now()->addMinutes($discoverDelay));

            // 3. Send connection requests to queued prospects
            RunCampaignJob::dispatch($campaign, $agent)
                ->delay(now()->addMinutes($connectionDelay));

            // 4. Process follow-up messages for connected prospects
            ProcessFollowUpsJob::dispatch($campaign, $agent)
                ->delay(now()->addMinutes($followUpDelay));

            $this->line("  - Campaign \"{$campaign->name}\" (user: {$userId}) queued with delays: sync={$syncDelay}m, discover={$discoverDelay}m, connect={$connectionDelay}m, follow-up={$followUpDelay}m");

            // Offset next user's campaign to avoid burst activity
            $userDelayOffset += rand(5, 10);
        }

        $this->info('All campaigns queued for processing.');

        return self::SUCCESS;
    }
}
