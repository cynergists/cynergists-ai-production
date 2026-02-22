<?php

use App\Models\PortalTenant;
use App\Models\SpecterEvent;
use App\Models\SpecterScoringRule;
use App\Models\SpecterSession;
use App\Models\SpecterVisitor;
use App\Services\Specter\SpecterIntentScoringService;

it('uses tenant scoring rules and returns structured feature breakdown', function () {
    $tenant = PortalTenant::factory()->create();

    $visitor = SpecterVisitor::query()->create([
        'tenant_id' => $tenant->id,
        'visitor_id' => 'visitor-scoring',
        'consent_state' => 'granted',
        'consent_version' => 'v1',
        'dnt' => false,
        'first_seen_at' => now()->subDay(),
        'last_seen_at' => now(),
    ]);

    $session = SpecterSession::query()->create([
        'tenant_id' => $tenant->id,
        'specter_visitor_id' => $visitor->id,
        'session_id' => 'session-scoring',
        'started_at' => now()->subMinutes(6),
        'ended_at' => now(),
    ]);

    SpecterEvent::query()->create([
        'tenant_id' => $tenant->id,
        'specter_session_id' => $session->id,
        'type' => 'page_view',
        'page_url' => 'https://example.com/pricing',
        'occurred_at' => now()->subMinutes(5),
        'metadata' => [],
        'is_bot' => false,
    ]);

    SpecterEvent::query()->create([
        'tenant_id' => $tenant->id,
        'specter_session_id' => $session->id,
        'type' => 'scroll',
        'page_url' => 'https://example.com/pricing',
        'occurred_at' => now()->subMinutes(4),
        'metadata' => ['depth' => 90],
        'is_bot' => false,
    ]);

    SpecterEvent::query()->create([
        'tenant_id' => $tenant->id,
        'specter_session_id' => $session->id,
        'type' => 'form_submit',
        'page_url' => 'https://example.com/demo',
        'occurred_at' => now()->subMinute(),
        'metadata' => [],
        'is_bot' => false,
    ]);

    SpecterScoringRule::query()->create([
        'tenant_id' => $tenant->id,
        'signal_key' => 'form_interaction_strength',
        'weight' => 2,
        'config' => ['tiers' => [1 => 5, 2 => 10, 3 => 20]],
        'is_active' => true,
        'sort_order' => 1,
    ]);

    SpecterScoringRule::query()->create([
        'tenant_id' => $tenant->id,
        'signal_key' => 'scroll_depth_max',
        'weight' => 1,
        'config' => ['tiers' => [50 => 10, 75 => 20]],
        'is_active' => true,
        'sort_order' => 2,
    ]);

    $result = app(SpecterIntentScoringService::class)->scoreSession($session->fresh(), $tenant);

    expect($result['intent_score'])->toBeGreaterThan(0);
    expect($result['intent_tier'])->toBeString();
    expect($result['heat_zone'])->toBeString();
    expect($result['scoring_feature_breakdown'])->toHaveKeys([
        'form_interaction_strength',
        'scroll_depth_max',
    ]);
    expect($result['scoring_feature_breakdown']['form_interaction_strength'])->toHaveKeys([
        'value',
        'weight',
        'points',
        'config',
    ]);
});

