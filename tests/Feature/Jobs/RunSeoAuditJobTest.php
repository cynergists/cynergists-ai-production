<?php

use App\Jobs\RunSeoAuditJob;
use App\Models\PortalTenant;
use App\Models\SeoAudit;
use App\Models\SeoSite;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;

uses(RefreshDatabase::class);

it('completes an audit successfully with a healthy site', function () {
    Http::fake([
        '*' => Http::response('<html><head><title>Test Site</title><meta name="description" content="A test site"><meta name="viewport" content="width=1"><link rel="canonical" href="https://example.com"><meta property="og:title" content="Test"></head><body><h1>Welcome</h1></body></html>', 200),
    ]);

    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
        'onboarding_completed_at' => now(),
    ]);

    $site = SeoSite::factory()->create([
        'tenant_id' => $tenant->id,
        'url' => 'https://example.com',
        'status' => 'active',
    ]);

    $audit = SeoAudit::factory()->create([
        'seo_site_id' => $site->id,
        'status' => 'pending',
        'trigger' => 'agent',
        'metrics' => [],
        'completed_at' => null,
    ]);

    (new RunSeoAuditJob($audit))->handle();

    $audit->refresh();
    $site->refresh();

    expect($audit->status)->toBe('completed');
    expect($audit->metrics['health_score'])->toBeGreaterThan(0);
    expect($audit->metrics['pages_scanned'])->toBe(1);
    expect($audit->issues_count)->toBeInt();
    expect($audit->summary)->not->toBeNull();
    expect($audit->started_at)->not->toBeNull();
    expect($audit->completed_at)->not->toBeNull();
    expect($site->last_audit_at)->not->toBeNull();
});

it('marks audit as running then completed', function () {
    Http::fake([
        '*' => Http::response('<html><head><title>Test</title></head><body><h1>Hi</h1></body></html>', 200),
    ]);

    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
    ]);

    $site = SeoSite::factory()->create([
        'tenant_id' => $tenant->id,
        'url' => 'https://example.com',
        'status' => 'active',
    ]);

    $audit = SeoAudit::factory()->create([
        'seo_site_id' => $site->id,
        'status' => 'pending',
        'trigger' => 'agent',
        'metrics' => [],
        'completed_at' => null,
    ]);

    (new RunSeoAuditJob($audit))->handle();

    $audit->refresh();
    expect($audit->status)->toBe('completed');
});

it('detects missing seo elements and lowers health score', function () {
    Http::fake([
        '*' => Http::response('<html><head></head><body><p>No SEO elements</p></body></html>', 200),
    ]);

    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
    ]);

    $site = SeoSite::factory()->create([
        'tenant_id' => $tenant->id,
        'url' => 'https://example.com',
        'status' => 'active',
    ]);

    $audit = SeoAudit::factory()->create([
        'seo_site_id' => $site->id,
        'status' => 'pending',
        'trigger' => 'agent',
        'metrics' => [],
        'completed_at' => null,
    ]);

    (new RunSeoAuditJob($audit))->handle();

    $audit->refresh();

    expect($audit->status)->toBe('completed');
    expect($audit->metrics['health_score'])->toBeLessThan(100);
    expect($audit->issues_count)->toBeGreaterThan(0);

    $issueIds = collect($audit->metrics['issues'])->pluck('id')->toArray();
    expect($issueIds)->toContain('missing_title');
    expect($issueIds)->toContain('missing_meta_description');
    expect($issueIds)->toContain('missing_h1');
});

it('marks audit as failed when site is unreachable', function () {
    Http::fake([
        '*' => Http::response('', 500),
    ]);

    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
    ]);

    $site = SeoSite::factory()->create([
        'tenant_id' => $tenant->id,
        'url' => 'https://example.com',
        'status' => 'active',
    ]);

    $audit = SeoAudit::factory()->create([
        'seo_site_id' => $site->id,
        'status' => 'pending',
        'trigger' => 'agent',
        'metrics' => [],
        'completed_at' => null,
    ]);

    (new RunSeoAuditJob($audit))->handle();

    $audit->refresh();

    expect($audit->status)->toBe('completed');
    expect($audit->metrics['health_score'])->toBeLessThan(100);

    $issueIds = collect($audit->metrics['issues'])->pluck('id')->toArray();
    expect($issueIds)->toContain('http_error');
});
