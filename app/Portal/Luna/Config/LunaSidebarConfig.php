<?php

namespace App\Portal\Luna\Config;

use App\Models\LunaGeneratedImage;
use App\Models\PortalTenant;

class LunaSidebarConfig
{
    /**
     * Get the sidebar configuration for Luna agent.
     */
    public static function getConfig(PortalTenant $tenant): array
    {
        return [
            'generation_stats' => self::getGenerationStats($tenant),
            'recent_images' => self::getRecentImages($tenant),
        ];
    }

    /**
     * Get image generation statistics.
     */
    private static function getGenerationStats(PortalTenant $tenant): array
    {
        $totalImages = LunaGeneratedImage::where('tenant_id', $tenant->id)
            ->where('status', 'completed')
            ->count();

        $thisMonthImages = LunaGeneratedImage::where('tenant_id', $tenant->id)
            ->where('status', 'completed')
            ->where('created_at', '>=', now()->startOfMonth())
            ->count();

        return [
            'total_images' => $totalImages,
            'this_month' => $thisMonthImages,
        ];
    }

    /**
     * Get recent generated images for the gallery.
     */
    private static function getRecentImages(PortalTenant $tenant): array
    {
        return LunaGeneratedImage::where('tenant_id', $tenant->id)
            ->where('status', 'completed')
            ->orderByDesc('created_at')
            ->take(12)
            ->get(['id', 'prompt', 'public_url', 'aspect_ratio', 'created_at'])
            ->map(fn ($image) => [
                'id' => $image->id,
                'prompt' => $image->prompt,
                'url' => $image->public_url,
                'aspect_ratio' => $image->aspect_ratio,
                'created_at' => $image->created_at->diffForHumans(),
            ])
            ->toArray();
    }
}
