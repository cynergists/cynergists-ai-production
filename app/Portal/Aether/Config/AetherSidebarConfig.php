<?php

namespace App\Portal\Aether\Config;

use App\Models\PortalTenant;

class AetherSidebarConfig
{
    /**
     * Get the sidebar configuration for Aether agent.
     *
     * @return array<string, mixed>
     */
    public static function getConfig(PortalTenant $tenant): array
    {
        $settings = $tenant->settings ?? [];
        $aetherData = $settings['aether_data'] ?? [];

        return [
            'pipeline_stats' => [
                'drafts' => $aetherData['drafts_count'] ?? 0,
                'published' => $aetherData['published_count'] ?? 0,
                'in_review' => $aetherData['in_review_count'] ?? 0,
            ],
            'recent_posts' => $aetherData['recent_posts'] ?? [],
            'content_pillars' => $aetherData['content_pillars'] ?? [],
        ];
    }
}
