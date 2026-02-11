<?php

namespace App\Portal\Briggs\Config;

use App\Models\BriggsTrainingScenario;
use App\Models\BriggsTrainingSession;
use App\Models\BriggsUserSettings;
use App\Models\PortalTenant;
use App\Models\User;

class BriggsSidebarConfig
{
    /**
     * Get the sidebar configuration for Briggs agent.
     *
     * @return array<string, mixed>
     */
    public static function getConfig(PortalTenant $tenant): array
    {
        return [
            'training_library' => self::getTrainingLibrary(),
            'recent_sessions' => self::getRecentSessions($tenant),
            'user_stats' => self::getUserStats($tenant),
        ];
    }

    /**
     * Get active training scenarios grouped by category.
     *
     * @return array<string, array<int, array<string, mixed>>>
     */
    private static function getTrainingLibrary(): array
    {
        return BriggsTrainingScenario::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get(['id', 'title', 'slug', 'category', 'difficulty', 'buyer_name', 'buyer_title', 'description'])
            ->groupBy('category')
            ->toArray();
    }

    /**
     * Get recent training sessions for the tenant's user.
     *
     * @return array<int, array<string, mixed>>
     */
    private static function getRecentSessions(PortalTenant $tenant): array
    {
        return BriggsTrainingSession::query()
            ->where('user_id', $tenant->user_id)
            ->with('scenario:id,title,category')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get(['id', 'title', 'scenario_id', 'status', 'score', 'category', 'difficulty', 'started_at', 'completed_at', 'duration_seconds'])
            ->toArray();
    }

    /**
     * Get user training stats.
     *
     * @return array<string, mixed>
     */
    private static function getUserStats(PortalTenant $tenant): array
    {
        $settings = BriggsUserSettings::forUser(User::find($tenant->user_id));

        return [
            'skill_level' => $settings->skill_level,
            'total_sessions' => $settings->total_sessions_completed,
            'average_score' => $settings->average_score,
            'onboarding_completed' => $settings->onboarding_completed,
        ];
    }
}
