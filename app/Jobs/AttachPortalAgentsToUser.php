<?php

namespace App\Jobs;

use App\Services\AgentAttachmentService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class AttachPortalAgentsToUser implements ShouldQueue
{
    use Queueable;

    /**
     * @param  non-empty-string  $email
     * @param  array<string>|null  $agentNames  Optional list of specific agent names to attach. If null, attaches all active agents.
     */
    public function __construct(
        public string $email,
        public ?string $companyName = null,
        public ?string $subdomain = null,
        public ?array $agentNames = null,
    ) {}

    /**
     * Execute the job by delegating to the service.
     */
    public function handle(AgentAttachmentService $service): void
    {
        $service->attachAgentsToUser(
            email: $this->email,
            agentNames: $this->agentNames,
            companyName: $this->companyName,
            subdomain: $this->subdomain
        );
    }
}
