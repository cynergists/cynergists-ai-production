<?php

namespace App\Console\Commands;

use App\Jobs\Apex\RunCampaignPipelineJob;
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

        $delayOffset = 0;

        foreach ($campaigns as $campaign) {
            $userId = $campaign->user_id;

            // Run full pipeline: sync → discover → connect → follow-up
            RunCampaignPipelineJob::dispatch($campaign, $agent)
                ->delay(now()->addMinutes($delayOffset));

            $this->line("  - Campaign \"{$campaign->name}\" (user: {$userId}) queued with delay: {$delayOffset}m");

            // Offset next campaign to avoid burst activity (human-like pacing)
            $delayOffset += rand(5, 10);
        }

        $this->info('All campaigns queued for processing.');

        return self::SUCCESS;
    }
}
