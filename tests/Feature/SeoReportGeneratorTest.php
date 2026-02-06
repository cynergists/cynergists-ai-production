<?php

use App\Models\SeoAudit;
use App\Models\SeoChange;
use App\Models\SeoRecommendation;
use App\Models\SeoSite;
use App\Services\SeoEngine\SeoReportGenerator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;

uses(RefreshDatabase::class);

it('generates a report with derived metrics', function () {
    $periodStart = Carbon::now()->startOfMonth();
    $periodEnd = Carbon::now()->endOfMonth();

    $site = SeoSite::factory()->create();
    $audit = SeoAudit::factory()->create([
        'seo_site_id' => $site->id,
        'issues_count' => 4,
        'completed_at' => now(),
    ]);

    SeoRecommendation::factory()->count(2)->create([
        'seo_site_id' => $site->id,
        'seo_audit_id' => $audit->id,
        'status' => 'pending',
        'created_at' => $periodStart->copy()->addDay(),
    ]);

    $approvedRecommendation = SeoRecommendation::factory()->create([
        'seo_site_id' => $site->id,
        'seo_audit_id' => $audit->id,
        'status' => 'approved',
        'created_at' => $periodStart->copy()->addDays(2),
    ]);

    SeoChange::factory()->create([
        'seo_site_id' => $site->id,
        'seo_recommendation_id' => $approvedRecommendation->id,
        'status' => 'applied',
        'created_at' => $periodStart->copy()->addDays(3),
    ]);

    $service = app(SeoReportGenerator::class);
    $report = $service->generateForSite($site, $periodStart, $periodEnd);

    expect($report->seo_site_id)->toBe($site->id);
    expect($report->highlights['pending_recommendations'])->toBe(2);
    expect($report->highlights['approved_recommendations'])->toBe(1);
    expect($report->metrics['issues_found'])->toBe(4);
    expect($report->metrics['changes_applied'])->toBe(1);
});
