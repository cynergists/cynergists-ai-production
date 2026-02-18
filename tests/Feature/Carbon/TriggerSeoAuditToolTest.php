<?php

use App\Ai\Tools\TriggerSeoAuditTool;
use App\Jobs\RunSeoAuditJob;
use App\Models\PortalTenant;
use App\Models\SeoAudit;
use App\Models\SeoSite;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Laravel\Ai\Tools\Request;

uses(RefreshDatabase::class);

function createTenantWithSite(array $siteOverrides = []): array
{
    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
        'onboarding_completed_at' => now(),
    ]);

    $site = SeoSite::factory()->create(array_merge([
        'tenant_id' => $tenant->id,
        'status' => 'active',
    ], $siteOverrides));

    return [$tenant, $site, $user];
}

it('triggers an audit for a valid active site', function () {
    Queue::fake();

    [$tenant, $site] = createTenantWithSite();

    $tool = new TriggerSeoAuditTool($tenant);
    $result = $tool->handle(new Request(['site_id' => $site->id]));

    expect($result)->toContain('SEO audit has been triggered');
    expect($result)->toContain($site->name);

    $audit = SeoAudit::where('seo_site_id', $site->id)->first();
    expect($audit)->not->toBeNull();
    expect($audit->status)->toBe('pending');
    expect($audit->trigger)->toBe('agent');

    Queue::assertPushed(RunSeoAuditJob::class, function ($job) use ($audit) {
        return $job->audit->id === $audit->id;
    });
});

it('rejects audit for non-existent site', function () {
    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
        'onboarding_completed_at' => now(),
    ]);

    $tool = new TriggerSeoAuditTool($tenant);
    $result = $tool->handle(new Request(['site_id' => 'non-existent-id']));

    expect($result)->toContain('Site not found');
});

it('rejects audit for site belonging to another tenant', function () {
    Queue::fake();

    $user1 = User::factory()->create();
    $tenant1 = PortalTenant::factory()->create([
        'user_id' => (string) $user1->id,
        'onboarding_completed_at' => now(),
    ]);

    $user2 = User::factory()->create();
    $tenant2 = PortalTenant::factory()->create([
        'user_id' => (string) $user2->id,
        'onboarding_completed_at' => now(),
    ]);

    $site = SeoSite::factory()->create([
        'tenant_id' => $tenant2->id,
        'status' => 'active',
    ]);

    $tool = new TriggerSeoAuditTool($tenant1);
    $result = $tool->handle(new Request(['site_id' => $site->id]));

    expect($result)->toContain('Site not found');
    Queue::assertNotPushed(RunSeoAuditJob::class);
});

it('rejects audit for inactive site', function () {
    Queue::fake();

    [$tenant, $site] = createTenantWithSite(['status' => 'paused']);

    $tool = new TriggerSeoAuditTool($tenant);
    $result = $tool->handle(new Request(['site_id' => $site->id]));

    expect($result)->toContain('not active');
    Queue::assertNotPushed(RunSeoAuditJob::class);
});

it('rejects audit when one is already running', function () {
    Queue::fake();

    [$tenant, $site] = createTenantWithSite();

    SeoAudit::factory()->create([
        'seo_site_id' => $site->id,
        'status' => 'running',
    ]);

    $tool = new TriggerSeoAuditTool($tenant);
    $result = $tool->handle(new Request(['site_id' => $site->id]));

    expect($result)->toContain('already running');
    Queue::assertNotPushed(RunSeoAuditJob::class);
});

it('has a description', function () {
    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
    ]);

    $tool = new TriggerSeoAuditTool($tenant);

    expect($tool->description())->toContain('Trigger an SEO audit');
});
