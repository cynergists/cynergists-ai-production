<?php

namespace App\Services\SeoEngine;

use App\Models\SeoAudit;
use App\Models\SeoChange;
use App\Models\SeoRecommendation;
use App\Models\SeoReport;
use App\Models\SeoSite;
use Illuminate\Support\Carbon;

class SeoReportGenerator
{
    public function generateForSite(SeoSite $site, string|Carbon $periodStart, string|Carbon $periodEnd): SeoReport
    {
        $start = Carbon::parse($periodStart)->startOfDay();
        $end = Carbon::parse($periodEnd)->endOfDay();

        $recommendationsBase = SeoRecommendation::query()
            ->where('seo_site_id', $site->id);

        $recommendationsInPeriod = (clone $recommendationsBase)
            ->whereBetween('created_at', [$start, $end]);

        $totalRecommendations = (clone $recommendationsInPeriod)->count();
        $pendingRecommendations = (clone $recommendationsInPeriod)->where('status', 'pending')->count();
        $approvedRecommendations = (clone $recommendationsInPeriod)->where('status', 'approved')->count();
        $rejectedRecommendations = (clone $recommendationsInPeriod)->where('status', 'rejected')->count();

        $changesInPeriod = SeoChange::query()
            ->where('seo_site_id', $site->id)
            ->whereBetween('created_at', [$start, $end]);

        $appliedChanges = (clone $changesInPeriod)->where('status', 'applied')->count();
        $failedChanges = (clone $changesInPeriod)->where('status', 'failed')->count();

        $latestAudit = SeoAudit::query()
            ->where('seo_site_id', $site->id)
            ->orderByDesc('completed_at')
            ->first();

        $issuesCount = $latestAudit?->issues_count ?? 0;

        $healthScore = max(0, min(100, 100 - ($issuesCount * 2) - ($pendingRecommendations * 3)));

        return SeoReport::create([
            'seo_site_id' => $site->id,
            'period_start' => $start->toDateString(),
            'period_end' => $end->toDateString(),
            'status' => 'ready',
            'highlights' => [
                'health_score' => $healthScore,
                'pending_recommendations' => $pendingRecommendations,
                'approved_recommendations' => $approvedRecommendations,
                'changes_applied' => $appliedChanges,
                'keywords_moved' => max(0, $appliedChanges * 3),
            ],
            'report_url' => null,
            'metrics' => [
                'issues_found' => $issuesCount,
                'recommendations_total' => $totalRecommendations,
                'recommendations_pending' => $pendingRecommendations,
                'recommendations_approved' => $approvedRecommendations,
                'recommendations_rejected' => $rejectedRecommendations,
                'changes_applied' => $appliedChanges,
                'changes_failed' => $failedChanges,
            ],
        ]);
    }
}
