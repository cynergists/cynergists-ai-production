<?php

namespace App\Console\Commands;

use App\Jobs\Apex\SyncLinkedInMessagesJob;
use App\Models\ApexCampaign;
use App\Models\ApexLinkedInAccount;
use App\Models\PortalAvailableAgent;
use Illuminate\Console\Command;

class SyncApexLinkedInMessagesCommand extends Command
{
    protected $signature = 'apex:sync-linkedin';

    protected $description = 'Sync LinkedIn messages for all users with active campaigns to detect replies and connection acceptances.';

    public function handle(): int
    {
        $agent = PortalAvailableAgent::query()
            ->where('name', 'Apex')
            ->first();

        if (! $agent) {
            $this->error('Apex agent not found.');

            return self::FAILURE;
        }

        // Find all users with active campaigns and active LinkedIn accounts
        $userIds = ApexCampaign::active()
            ->distinct()
            ->pluck('user_id');

        if ($userIds->isEmpty()) {
            $this->info('No users with active campaigns found.');

            return self::SUCCESS;
        }

        $linkedInAccounts = ApexLinkedInAccount::query()
            ->whereIn('user_id', $userIds)
            ->where('status', 'active')
            ->with('user')
            ->get();

        if ($linkedInAccounts->isEmpty()) {
            $this->info('No active LinkedIn accounts found for users with active campaigns.');

            return self::SUCCESS;
        }

        $this->info("Syncing LinkedIn messages for {$linkedInAccounts->count()} user(s)...");

        $delayOffset = 0;

        foreach ($linkedInAccounts as $account) {
            SyncLinkedInMessagesJob::dispatch($account->user, $agent)
                ->delay(now()->addSeconds($delayOffset));

            $this->line("  - User {$account->user_id} queued for sync with delay: {$delayOffset}s");

            // Stagger syncs to avoid API bursts
            $delayOffset += rand(10, 30);
        }

        $this->info('All sync jobs queued.');

        return self::SUCCESS;
    }
}
