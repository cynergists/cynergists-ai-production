<?php

namespace App\Jobs\Specter;

use App\Models\PortalTenant;
use App\Services\Specter\SpecterIngestService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessSpecterIngestJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * @param  array<string,mixed>  $payload
     */
    public function __construct(
        public string $tenantId,
        public array $payload
    ) {}

    public function handle(SpecterIngestService $ingestService): void
    {
        $tenant = PortalTenant::query()->find($this->tenantId);
        if (! $tenant) {
            return;
        }

        $ingestService->ingest($tenant, $this->payload);
    }
}
