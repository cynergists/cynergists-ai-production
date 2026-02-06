<?php

namespace Database\Seeders;

use App\Models\SeoAudit;
use App\Models\SeoChange;
use App\Models\SeoRecommendation;
use App\Models\SeoRecommendationApproval;
use App\Models\SeoReport;
use App\Models\SeoSite;
use Illuminate\Database\Seeder;

class SeoEngineSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $site = SeoSite::factory()->create();

        $completedAudit = SeoAudit::factory()->create([
            'seo_site_id' => $site->id,
            'status' => 'completed',
            'issues_count' => 12,
            'started_at' => now()->subDays(2),
            'completed_at' => now()->subDays(2)->addHour(),
        ]);

        $runningAudit = SeoAudit::factory()->create([
            'seo_site_id' => $site->id,
            'status' => 'running',
            'issues_count' => 4,
            'started_at' => now()->subHours(6),
            'completed_at' => null,
        ]);

        $pendingRecommendation = SeoRecommendation::factory()->create([
            'seo_site_id' => $site->id,
            'seo_audit_id' => $completedAudit->id,
            'status' => 'pending',
        ]);

        $approvedRecommendation = SeoRecommendation::factory()->create([
            'seo_site_id' => $site->id,
            'seo_audit_id' => $completedAudit->id,
            'status' => 'approved',
            'approved_at' => now()->subDay(),
        ]);

        $appliedRecommendation = SeoRecommendation::factory()->create([
            'seo_site_id' => $site->id,
            'seo_audit_id' => $runningAudit->id,
            'status' => 'applied',
            'approved_at' => now()->subDays(3),
            'applied_at' => now()->subDays(2),
        ]);

        SeoRecommendationApproval::factory()->create([
            'seo_recommendation_id' => $approvedRecommendation->id,
            'decision' => 'approved',
            'decided_at' => now()->subDay(),
        ]);

        SeoRecommendationApproval::factory()->create([
            'seo_recommendation_id' => $appliedRecommendation->id,
            'decision' => 'approved',
            'decided_at' => now()->subDays(3),
        ]);

        SeoChange::factory()->create([
            'seo_site_id' => $site->id,
            'seo_recommendation_id' => $appliedRecommendation->id,
            'status' => 'applied',
            'applied_at' => now()->subDays(2),
        ]);

        SeoReport::factory()->create([
            'seo_site_id' => $site->id,
            'period_start' => now()->subMonthNoOverflow()->startOfMonth()->toDateString(),
            'period_end' => now()->subMonthNoOverflow()->endOfMonth()->toDateString(),
            'status' => 'ready',
        ]);
    }
}
