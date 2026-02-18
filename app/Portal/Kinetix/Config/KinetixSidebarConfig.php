<?php

namespace App\Portal\Kinetix\Config;

use App\Models\PortalTenant;

class KinetixSidebarConfig
{
    /**
     * Get the sidebar configuration for Kinetix agent.
     *
     * @return array<string, mixed>
     */
    public static function getConfig(PortalTenant $tenant): array
    {
        $settings = $tenant->settings ?? [];
        $kinetixData = $settings['kinetix_data'] ?? [];

        return [
            'usage' => [
                'monthly_limit' => $kinetixData['monthly_limit'] ?? 10,
                'current_usage' => $kinetixData['current_usage'] ?? 0,
            ],
            'brand' => [
                'brand_name' => $kinetixData['brand_name'] ?? $tenant->company_name ?? '',
                'style_preset' => $kinetixData['style_preset'] ?? 'Modern',
                'default_duration' => $kinetixData['default_duration'] ?? 30,
                'default_aspect_ratio' => $kinetixData['default_aspect_ratio'] ?? '16:9',
            ],
            'recent_videos' => $kinetixData['recent_videos'] ?? [],
        ];
    }
}
