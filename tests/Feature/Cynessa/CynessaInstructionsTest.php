<?php

use App\Ai\Agents\Cynessa;
use App\Models\PortalTenant;
use App\Models\User;

it('includes DOES NOT boundary constraints in onboarding instructions', function () {
    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
        'onboarding_completed_at' => null,
    ]);

    $agent = new Cynessa(user: $user, tenant: $tenant);
    $instructions = (string) $agent->instructions();

    expect($instructions)->toContain('STRICT BOUNDARIES');
    expect($instructions)->toContain('Provide consulting, strategy, or business advice');
    expect($instructions)->toContain('Answer billing questions');
    expect($instructions)->toContain('Configure or onboard individual AI agents');
    expect($instructions)->toContain('Promise results, outcomes, or guarantees');
    expect($instructions)->toContain('Pretend to be human');
    expect($instructions)->toContain('Invent features, integrations, or capabilities');
    expect($instructions)->toContain('Compare Cynergists to competitors');
    expect($instructions)->toContain('legal advice');
    expect($instructions)->toContain('zip, exe, dmg, iso');
    expect($instructions)->toContain('upsell');
    expect($instructions)->toContain('Expose internal tools');
});

it('includes DOES NOT boundary constraints in completed instructions', function () {
    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
        'onboarding_completed_at' => now(),
    ]);

    $agent = new Cynessa(user: $user, tenant: $tenant);
    $instructions = (string) $agent->instructions();

    expect($instructions)->toContain('STRICT BOUNDARIES');
    expect($instructions)->toContain('Provide consulting, strategy, or business advice');
});

it('includes escalation trigger rules', function () {
    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
        'onboarding_completed_at' => null,
    ]);

    $agent = new Cynessa(user: $user, tenant: $tenant);
    $instructions = (string) $agent->instructions();

    expect($instructions)->toContain('ESCALATION TRIGGERS');
    expect($instructions)->toContain('[ESCALATE: billing]');
    expect($instructions)->toContain('[ESCALATE: legal]');
    expect($instructions)->toContain('[ESCALATE: human_request]');
    expect($instructions)->toContain('[ESCALATE: unknown]');
    expect($instructions)->toContain('[ESCALATE: technical]');
});

it('includes new data fields in onboarding sequence', function () {
    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
        'onboarding_completed_at' => null,
    ]);

    $agent = new Cynessa(user: $user, tenant: $tenant);
    $instructions = (string) $agent->instructions();

    expect($instructions)->toContain('Website');
    expect($instructions)->toContain('Business description');
    expect($instructions)->toContain('Brand colors');
    expect($instructions)->toContain('website=');
    expect($instructions)->toContain('business_description=');
    expect($instructions)->toContain('brand_colors=');
});

it('includes identity rules', function () {
    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
        'onboarding_completed_at' => null,
    ]);

    $agent = new Cynessa(user: $user, tenant: $tenant);
    $instructions = (string) $agent->instructions();

    expect($instructions)->toContain('IDENTITY RULES');
    expect($instructions)->toContain('AI assistant');
    expect($instructions)->toContain('Never impersonate a human');
});

it('includes file type restrictions', function () {
    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
        'onboarding_completed_at' => null,
    ]);

    $agent = new Cynessa(user: $user, tenant: $tenant);
    $instructions = (string) $agent->instructions();

    expect($instructions)->toContain('ACCEPTED FILE TYPES');
    expect($instructions)->toContain('REJECTED FILE TYPES');
    expect($instructions)->toContain('jpg, jpeg, png, svg, gif, pdf, doc, docx, txt, mp4, mov');
    expect($instructions)->toContain('zip, exe, dmg, iso');
});

it('includes mandatory post-onboarding message requirements', function () {
    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
        'onboarding_completed_at' => null,
    ]);

    $agent = new Cynessa(user: $user, tenant: $tenant);
    $instructions = (string) $agent->instructions();

    expect($instructions)->toContain('MANDATORY post-onboarding message');
    expect($instructions)->toContain('Each AI agent in their dashboard must be configured individually');
    expect($instructions)->toContain('Cynergists team will review');
});

it('tracks new fields in user context', function () {
    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
        'onboarding_completed_at' => null,
        'company_name' => 'TestCo',
        'settings' => [
            'website' => 'https://testco.com',
            'industry' => 'Tech',
            'business_description' => 'We build things',
            'services_needed' => 'SEO',
            'brand_tone' => 'Professional',
            'brand_colors' => 'Blue and gold',
        ],
    ]);

    $agent = new Cynessa(user: $user, tenant: $tenant);
    $instructions = (string) $agent->instructions();

    expect($instructions)->toContain('https://testco.com');
    expect($instructions)->toContain('We build things');
    expect($instructions)->toContain('Blue and gold');
});
