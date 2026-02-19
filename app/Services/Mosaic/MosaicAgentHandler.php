<?php

namespace App\Services\Mosaic;

use App\Models\PortalAvailableAgent;
use App\Models\PortalTenant;
use App\Models\User;

class MosaicAgentHandler
{
    public function __construct(private MosaicOnboardingService $onboardingService) {}

    public function handle(string $message, User $user, PortalAvailableAgent $agent, PortalTenant $tenant): string
    {
        return $this->onboardingService->handleMessage($message, $user, $tenant);
    }
}
