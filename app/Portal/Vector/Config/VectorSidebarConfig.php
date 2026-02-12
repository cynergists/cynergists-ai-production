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
            'performance' => [
                'roas' => $vectorData['roas'] ?? 0,
                'total_spend' => $vectorData['total_spend'] ?? 0,
                'cpa' => $vectorData['cpa'] ?? 0,
                'conversions' => $vectorData['conversions'] ?? 0,
            ],
            'platforms' => $vectorData['platforms'] ?? ['Meta', 'Google Ads', 'TikTok', 'LinkedIn'],
            'active_campaigns' => $vectorData['active_campaigns'] ?? 0,
            'recent_actions' => $vectorData['recent_actions'] ?? [],
        ];
    }
}
