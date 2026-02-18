<?php

namespace App\Portal\Optix\Config;

use App\Models\PortalTenant;

class OptixSidebarConfig
{
    /**
     * Get the sidebar configuration for Optix agent.
     *
     * @return array<string, mixed>
     */
    public static function getConfig(PortalTenant $tenant): array
    {
        $settings = $tenant->settings ?? [];
        $optixData = $settings['optix_data'] ?? [];

        return [
            'channel_stats' => [
                'subscribers' => $optixData['subscribers'] ?? 0,
                'total_videos' => $optixData['total_videos'] ?? 0,
                'total_views' => $optixData['total_views'] ?? 0,
            ],
            'channel_bible' => $optixData['channel_bible'] ?? null,
            'recent_videos' => $optixData['recent_videos'] ?? [],
            'top_ideas' => $optixData['top_ideas'] ?? [],
        ];
    }
}
