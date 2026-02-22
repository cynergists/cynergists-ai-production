<?php

use App\Models\PortalTenant;
use App\Models\SpecterEscalationLog;
use App\Models\SpecterSession;
use App\Models\SpecterTriggerLog;
use App\Models\User;

function specterIngestPayload(string $tenantId, string $siteKey, array $overrides = []): array
{
    $base = [
        'tenant_id' => $tenantId,
        'site_key' => $siteKey,
        'visitor_id' => 'visitor-123',
        'session_id' => 'session-abc',
        'cookie_ids' => ['cookie-1'],
        'consent_state' => 'granted',
        'consent_version' => 'v1',
        'dnt' => false,
        'events' => [
            [
                'type' => 'page_view',
                'page_url' => 'https://example.com/pricing',
                'timestamp' => now()->subSeconds(400)->toIso8601String(),
                'metadata' => [
                    'referrer' => 'https://google.com',
                    'utm' => ['source' => 'google', 'campaign' => 'brand'],
                    'device_type' => 'desktop',
                ],
            ],
            [
                'type' => 'scroll',
                'page_url' => 'https://example.com/pricing',
                'timestamp' => now()->subSeconds(350)->toIso8601String(),
                'metadata' => ['depth' => 80],
            ],
            [
                'type' => 'page_view',
                'page_url' => 'https://example.com/demo',
                'timestamp' => now()->subSeconds(200)->toIso8601String(),
                'metadata' => ['device_type' => 'desktop'],
            ],
            [
                'type' => 'form_start',
                'page_url' => 'https://example.com/demo',
                'timestamp' => now()->subSeconds(120)->toIso8601String(),
                'metadata' => ['form_fields' => ['email' => 'lead@example.com', 'name' => 'Jane Doe']],
            ],
            [
                'type' => 'form_submit',
                'page_url' => 'https://example.com/demo',
                'timestamp' => now()->subSeconds(30)->toIso8601String(),
                'metadata' => ['email' => 'lead@example.com', 'name' => 'Jane Doe'],
            ],
        ],
    ];

    return array_replace_recursive($base, $overrides);
}

it('ingests events, scores session, and logs a high intent workflow trigger', function () {
    config()->set('services.gohighlevel.api_key', null);
    config()->set('services.gohighlevel.location_id', null);

    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
        'settings' => [
            'specter_data' => [
                'site_key' => 'specter-test-key',
            ],
        ],
    ]);

    $response = $this->postJson('/api/specter/ingest', specterIngestPayload($tenant->id, 'specter-test-key'));

    $response->assertStatus(202)
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.session_id', 'session-abc');

    $session = SpecterSession::query()->where('tenant_id', $tenant->id)->where('session_id', 'session-abc')->first();

    expect($session)->not->toBeNull();
    expect($session->intent_score)->toBeGreaterThanOrEqual(70);
    expect($session->intent_tier)->toBe('high');
    expect($session->heat_zone)->toBeIn(['high', 'medium']);

    expect(SpecterTriggerLog::query()->where('tenant_id', $tenant->id)->count())->toBe(1);
});

it('enforces consent gating and logs a haven escalation when consent is restricted', function () {
    config()->set('services.gohighlevel.api_key', null);
    config()->set('services.gohighlevel.location_id', null);

    $tenant = PortalTenant::factory()->create([
        'settings' => [
            'specter_data' => [
                'site_key' => 'specter-test-key',
            ],
        ],
    ]);

    $payload = specterIngestPayload($tenant->id, 'specter-test-key', [
        'consent_state' => 'denied',
        'dnt' => true,
        'session_id' => 'session-denied',
        'visitor_id' => 'visitor-denied',
    ]);

    $response = $this->postJson('/api/specter/ingest', $payload);

    $response->assertStatus(202)
        ->assertJsonPath('data.resolution_status', 'unresolved')
        ->assertJsonPath('data.resolution_source', 'consent_restricted');

    $session = SpecterSession::query()->where('session_id', 'session-denied')->first();
    expect($session)->not->toBeNull();
    expect($session->resolution_status)->toBe('unresolved');
    expect($session->resolution_source)->toBe('consent_restricted');

    expect(
        SpecterEscalationLog::query()
            ->where('tenant_id', $tenant->id)
            ->where('reason_code', 'consent_restricted')
            ->exists()
    )->toBeTrue();
});

