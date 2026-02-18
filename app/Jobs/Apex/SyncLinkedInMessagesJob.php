<?php

namespace App\Jobs\Apex;

use App\Models\ApexLinkedInAccount;
use App\Models\PortalAvailableAgent;
use App\Models\User;
use App\Services\Apex\LinkedInSyncService;
use App\Services\Apex\UnipileService;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class SyncLinkedInMessagesJob implements ShouldBeUnique, ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $backoff = 60;

    public int $uniqueFor = 300;

    public function __construct(
        public User $user,
        public PortalAvailableAgent $agent
    ) {}

    public function uniqueId(): string
    {
        return 'apex-sync-'.$this->user->id;
    }

    public function handle(UnipileService $unipileService, LinkedInSyncService $syncService): void
    {
        $linkedInAccount = ApexLinkedInAccount::query()
            ->where('user_id', $this->user->id)
            ->where('status', 'active')
            ->first();

        if (! $linkedInAccount) {
            Log::info("No active LinkedIn account for user {$this->user->id}, skipping sync.");

            return;
        }

        $unipileService->forAgent($this->agent);

        if (! $unipileService->isConfigured()) {
            Log::warning("UnipileService not configured for agent {$this->agent->id}");

            return;
        }

        $syncService->sync($unipileService, $linkedInAccount, $this->user);
    }
}
