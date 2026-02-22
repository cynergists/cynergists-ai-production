<?php

use App\Ai\Agents\Specter;
use App\Models\PortalTenant;
use App\Models\User;

it('includes specter purpose and core capabilities', function () {
    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
    ]);

    $agent = new Specter(user: $user, tenant: $tenant);
    $instructions = (string) $agent->instructions();

    expect($instructions)->toContain('You are Specter');
    expect($instructions)->toContain('Website Intelligence & Identity Resolution Agent');
    expect($instructions)->toContain('Real time anonymous visitor monitoring');
    expect($instructions)->toContain('Behavioral depth and duration scoring');
    expect($instructions)->toContain('Go High Level (GHL) as the primary CRM system of record');
});

it('includes hard exclusions and compliance boundaries', function () {
    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
    ]);

    $agent = new Specter(user: $user, tenant: $tenant);
    $instructions = (string) $agent->instructions();

    expect($instructions)->toContain('EXPLICIT EXCLUSIONS (MUST NOT DO)');
    expect($instructions)->toContain('Execute outreach or contact prospects directly');
    expect($instructions)->toContain('Bypass consent or regulatory requirements');
    expect($instructions)->toContain('OPERATIONAL BOUNDARIES (HARD LIMITS)');
    expect($instructions)->toContain('Do not store raw personal data outside approved CRM systems');
    expect($instructions)->toContain('Honor DNT where applicable');
});

it('includes escalation, logging, and required deliverables', function () {
    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
    ]);

    $agent = new Specter(user: $user, tenant: $tenant);
    $instructions = (string) $agent->instructions();

    expect($instructions)->toContain('MANDATORY ESCALATION BEHAVIOR');
    expect($instructions)->toContain('Escalate to Haven');
    expect($instructions)->toContain('CRM LOGGING EXPECTATIONS');
    expect($instructions)->toContain('session_id, visitor_id, intent_tier, top_signals, resolution_confidence');
    expect($instructions)->toContain('DELIVERABLES REQUIRED IN YOUR OUTPUT');
    expect($instructions)->toContain('Tracking snippet behavior (JS event schema + batching)');
    expect($instructions)->toContain('Test plan (unit, integration, load, compliance)');
});
