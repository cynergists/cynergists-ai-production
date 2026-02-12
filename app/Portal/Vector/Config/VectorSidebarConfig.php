<?php

namespace App\Portal\Vector\Config;

use App\Models\PortalTenant;

class VectorSidebarConfig
{
    /**
     * Get the sidebar configuration for Vector agent.
     *
     * @return array<string, mixed>
     */
    public static function getConfig(PortalTenant $tenant): array
    {
        $settings = $tenant->settings ?? [];
        $vectorData = $settings['vector_data'] ?? [];

        return [
            'metrics' => $vectorData['metrics'] ?? [
                'total_spend' => null,
                'roas' => null,
                'cpa' => null,
                'conversions' => null,
                'active_campaigns' => 0,
            ],
            'platforms' => $vectorData['platforms'] ?? [],
            'recent_actions' => $vectorData['recent_actions'] ?? [],
        ];
    }
}
