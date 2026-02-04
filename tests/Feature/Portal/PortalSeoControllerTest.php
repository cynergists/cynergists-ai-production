<?php

use App\Models\PortalTenant;
use App\Models\SeoAudit;
use App\Models\SeoChange;
use App\Models\SeoRecommendation;
use App\Models\SeoRecommendationApproval;
use App\Models\SeoReport;
use App\Models\SeoSite;
use App\Models\User;

it('returns seo overview for the authenticated tenant', function () {
    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
        'is_temp_subdomain' => false,
    ]);

    $site = SeoSite::factory()->create([
        'tenant_id' => $tenant->id,
        'user_id' => $user->id,
    ]);

    $audit = SeoAudit::factory()->create([
        'seo_site_id' => $site->id,
    ]);

    SeoRecommendation::factory()->create([
        'seo_site_id' => $site->id,
        'seo_audit_id' => $audit->id,
        'status' => 'pending',
        'impact_score' => 82,
    ]);

    $approvedRecommendation = SeoRecommendation::factory()->create([
        'seo_site_id' => $site->id,
        'seo_audit_id' => $audit->id,
        'status' => 'approved',
        'impact_score' => 70,
    ]);

    SeoChange::factory()->create([
        'seo_site_id' => $site->id,
        'seo_recommendation_id' => $approvedRecommendation->id,
        'status' => 'applied',
    ]);

    SeoReport::factory()->create([
        'seo_site_id' => $site->id,
        'status' => 'ready',
    ]);

    $otherUser = User::factory()->create();
    $otherTenant = PortalTenant::factory()->create([
        'user_id' => (string) $otherUser->id,
    ]);
    $otherSite = SeoSite::factory()->create([
        'tenant_id' => $otherTenant->id,
        'user_id' => $otherUser->id,
    ]);
    $otherAudit = SeoAudit::factory()->create([
        'seo_site_id' => $otherSite->id,
    ]);
    SeoRecommendation::factory()->create([
        'seo_site_id' => $otherSite->id,
        'seo_audit_id' => $otherAudit->id,
        'status' => 'pending',
    ]);

    $response = $this->actingAs($user)->getJson('/api/portal/seo/overview');

    $response->assertSuccessful();
    $response->assertJsonPath('stats.siteCount', 1);
    $response->assertJsonPath('stats.pendingRecommendations', 1);
    $response->assertJsonPath('stats.approvedRecommendations', 1);
    $response->assertJsonPath('stats.changesApplied', 1);
    $response->assertJsonPath('stats.reportsReady', 1);
    $response->assertJsonCount(1, 'sites');
    $response->assertJsonPath('sites.0.id', $site->id);
});

it('stores a seo site for the tenant', function () {
    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
        'is_temp_subdomain' => false,
    ]);

    $payload = [
        'name' => 'Acme SEO',
        'url' => 'https://acme.test',
    ];

    $response = $this->actingAs($user)->postJson('/api/portal/seo/sites', $payload);

    $response->assertCreated();
    $this->assertDatabaseHas('seo_sites', [
        'tenant_id' => $tenant->id,
        'user_id' => $user->id,
        'name' => 'Acme SEO',
        'url' => 'https://acme.test',
    ]);
});

it('approves a pending recommendation', function () {
    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
        'is_temp_subdomain' => false,
    ]);
    $site = SeoSite::factory()->create([
        'tenant_id' => $tenant->id,
        'user_id' => $user->id,
    ]);
    $audit = SeoAudit::factory()->create([
        'seo_site_id' => $site->id,
    ]);

    $recommendation = SeoRecommendation::factory()->create([
        'seo_site_id' => $site->id,
        'seo_audit_id' => $audit->id,
        'status' => 'pending',
    ]);

    $response = $this->actingAs($user)->postJson(
        "/api/portal/seo/recommendations/{$recommendation->id}/decision",
        [
            'decision' => 'approved',
            'notes' => 'Looks good.',
        ]
    );

    $response->assertSuccessful();
    $this->assertDatabaseHas('seo_recommendations', [
        'id' => $recommendation->id,
        'status' => 'approved',
    ]);
    $this->assertDatabaseHas('seo_recommendation_approvals', [
        'seo_recommendation_id' => $recommendation->id,
        'user_id' => $user->id,
        'decision' => 'approved',
    ]);

    expect(SeoRecommendationApproval::query()->where('seo_recommendation_id', $recommendation->id)->exists())
        ->toBeTrue();
});

it('generates a seo report for a tenant site', function () {
    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
        'is_temp_subdomain' => false,
    ]);
    $site = SeoSite::factory()->create([
        'tenant_id' => $tenant->id,
        'user_id' => $user->id,
    ]);

    $payload = [
        'seo_site_id' => $site->id,
        'period_start' => now()->subDays(30)->toDateString(),
        'period_end' => now()->toDateString(),
    ];

    $response = $this->actingAs($user)->postJson('/api/portal/seo/reports/generate', $payload);

    $response->assertCreated();
    $response->assertJsonPath('report.seo_site_id', $site->id);

    $this->assertDatabaseHas('seo_reports', [
        'seo_site_id' => $site->id,
    ]);
});
