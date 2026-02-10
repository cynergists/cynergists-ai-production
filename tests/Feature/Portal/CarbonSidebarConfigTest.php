<?php

use App\Models\PortalTenant;
use App\Models\SeoAudit;
use App\Models\SeoSite;
use App\Models\User;
use App\Portal\Carbon\Config\CarbonSidebarConfig;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('returns null health score when no audits exist', function () {
    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
        'onboarding_completed_at' => now(),
    ]);

    SeoSite::factory()->create([
        'tenant_id' => $tenant->id,
        'status' => 'active',
    ]);

    $config = CarbonSidebarConfig::getConfig($tenant);

    expect($config['seo_stats']['health_score'])->toBeNull();
});

it('returns calculated health score when audits exist', function () {
    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
        'onboarding_completed_at' => now(),
    ]);

    $site = SeoSite::factory()->create([
        'tenant_id' => $tenant->id,
        'status' => 'active',
    ]);

    SeoAudit::factory()->create([
        'seo_site_id' => $site->id,
        'status' => 'completed',
        'completed_at' => now(),
        'metrics' => ['health_score' => 82],
    ]);

    $config = CarbonSidebarConfig::getConfig($tenant);

    expect($config['seo_stats']['health_score'])->not->toBeNull();
});
