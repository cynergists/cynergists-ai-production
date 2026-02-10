<?php

namespace App\Portal\Apex\Config;

use App\Models\ApexLinkedInAccount;
use App\Models\PortalAvailableAgent;
use App\Models\PortalTenant;

class ApexSidebarConfig
{
    /**
     * Get the sidebar configuration for Apex agent.
     */
    public static function getConfig(PortalTenant $tenant): array
    {
        return [
            'linkedin' => self::getLinkedInStatus($tenant),
            'available_agent_id' => self::getAvailableAgentId(),
        ];
    }

    /**
     * Get LinkedIn connection status for the tenant's user.
     */
    private static function getLinkedInStatus(PortalTenant $tenant): array
    {
        $account = ApexLinkedInAccount::query()
            ->where('user_id', $tenant->user_id)
            ->latest()
            ->first();

        if (! $account) {
            return [
                'connected' => false,
                'status' => null,
                'display_name' => null,
                'avatar_url' => null,
                'requires_checkpoint' => false,
                'account_id' => null,
            ];
        }

        return [
            'connected' => $account->isActive(),
            'status' => $account->status,
            'display_name' => $account->display_name,
            'avatar_url' => $account->avatar_url,
            'requires_checkpoint' => $account->requiresCheckpoint(),
            'account_id' => $account->id,
        ];
    }

    /**
     * Get the PortalAvailableAgent ID for Apex (needed for LinkedIn API calls).
     */
    private static function getAvailableAgentId(): ?string
    {
        return PortalAvailableAgent::query()
            ->where('name', 'Apex')
            ->value('id');
    }
}
