<?php

namespace App\Portal\Carbon\Config;

use App\Models\PortalTenant;
use App\Models\SeoAudit;
use App\Models\SeoSite;
use Illuminate\Support\Collection;

class CarbonSidebarConfig
{
    /**
     * Get the sidebar configuration for Carbon agent.
     */
    public static function getConfig(PortalTenant $tenant): array
    {
        return [
            'seo_stats' => self::getSeoStats($tenant),
            'sites' => self::getSites($tenant),
            'recent_audits' => self::getRecentAudits($tenant),
            'top_recommendations' => self::getTopRecommendations($tenant),
        ];
    }

    /**
     * Get SEO statistics overview.
     */
    private static function getSeoStats(PortalTenant $tenant): array
    {
        $sites = SeoSite::where('tenant_id', $tenant->id)->get();
        $activeSites = $sites->where('status', 'active')->count();
        $activeAudits = SeoAudit::whereIn('seo_site_id', $sites->pluck('id'))
            ->where('status', 'running')
            ->count();

        // Calculate average health score from completed audits
        $recentAudits = SeoAudit::whereIn('seo_site_id', $sites->pluck('id'))
            ->where('status', 'completed')
            ->orderByDesc('completed_at')
            ->take(10)
            ->get();

        $avgHealthScore = $recentAudits->avg('results.health_score') ?? 75;

        // Get metric distributions
        $metrics = self::calculateMetrics($recentAudits);

        return [
            'health_score' => round($avgHealthScore),
            'total_sites' => $sites->count(),
            'active_audits' => $activeAudits,
            'metrics' => $metrics,
        ];
    }

    /**
     * Calculate SEO metrics from audits.
     */
    private static function calculateMetrics(Collection $audits): array
    {
        if ($audits->isEmpty()) {
            return [
                ['id' => 'good', 'label' => 'Good', 'value' => 0, 'status' => 'good'],
                ['id' => 'warning', 'label' => 'Warning', 'value' => 0, 'status' => 'warning'],
                ['id' => 'poor', 'label' => 'Poor', 'value' => 0, 'status' => 'poor'],
            ];
        }

        $good = $audits->filter(fn ($audit) => ($audit->results['health_score'] ?? 0) >= 80)->count();
        $warning = $audits->filter(fn ($audit) => ($audit->results['health_score'] ?? 0) >= 60 && ($audit->results['health_score'] ?? 0) < 80)->count();
        $poor = $audits->filter(fn ($audit) => ($audit->results['health_score'] ?? 0) < 60)->count();

        return [
            ['id' => 'good', 'label' => 'Good', 'value' => $good, 'status' => 'good'],
            ['id' => 'warning', 'label' => 'Warning', 'value' => $warning, 'status' => 'warning'],
            ['id' => 'poor', 'label' => 'Poor', 'value' => $poor, 'status' => 'poor'],
        ];
    }

    /**
     * Get active SEO sites for the tenant.
     */
    private static function getSites(PortalTenant $tenant): array
    {
        return SeoSite::where('tenant_id', $tenant->id)
            ->where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name', 'url', 'status', 'last_audit_at'])
            ->map(fn ($site) => [
                'id' => $site->id,
                'name' => $site->name,
                'url' => $site->url,
                'status' => $site->status,
                'last_audit' => $site->last_audit_at?->diffForHumans(),
            ])
            ->toArray();
    }

    /**
     * Get recent audit history.
     */
    private static function getRecentAudits(PortalTenant $tenant): array
    {
        $sites = SeoSite::where('tenant_id', $tenant->id)->pluck('id');

        return SeoAudit::with('site:id,name')
            ->whereIn('seo_site_id', $sites)
            ->orderByDesc('created_at')
            ->take(5)
            ->get(['id', 'seo_site_id', 'status', 'trigger', 'issues_count', 'created_at', 'completed_at'])
            ->map(fn ($audit) => [
                'id' => $audit->id,
                'site_name' => $audit->site->name ?? 'Unknown',
                'status' => $audit->status,
                'trigger' => $audit->trigger,
                'issues_count' => $audit->issues_count ?? 0,
                'date' => $audit->completed_at?->diffForHumans() ?? $audit->created_at->diffForHumans(),
            ])
            ->toArray();
    }

    /**
     * Get top priority SEO recommendations.
     */
    private static function getTopRecommendations(PortalTenant $tenant): array
    {
        $sites = SeoSite::where('tenant_id', $tenant->id)->pluck('id');

        // Get latest audits for each site
        $audits = SeoAudit::whereIn('seo_site_id', $sites)
            ->where('status', 'completed')
            ->orderByDesc('completed_at')
            ->take(3)
            ->get();

        $recommendations = [];

        foreach ($audits as $audit) {
            $issues = $audit->results['issues'] ?? [];
            foreach ($issues as $issue) {
                if (($issue['priority'] ?? 'low') === 'high') {
                    $recommendations[] = [
                        'id' => $issue['id'] ?? uniqid(),
                        'site_name' => $audit->site->name ?? 'Unknown',
                        'title' => $issue['title'] ?? 'SEO Issue',
                        'priority' => $issue['priority'] ?? 'medium',
                        'type' => $issue['type'] ?? 'general',
                    ];

                    if (count($recommendations) >= 5) {
                        break 2;
                    }
                }
            }
        }

        return $recommendations;
    }
}
