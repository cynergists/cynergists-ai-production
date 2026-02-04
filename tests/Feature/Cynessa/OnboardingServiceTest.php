<?php

use App\Models\PortalTenant;
use App\Models\User;
use App\Services\Cynessa\OnboardingService;

it('saves brand_tone to tenant settings', function () {
    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
        'company_name' => 'Test Company',
        'settings' => [],
    ]);

    $service = new OnboardingService;

    $service->updateCompanyInfo($tenant, [
        'brand_tone' => '#556633',
    ]);

    $tenant->refresh();

    expect($tenant->settings['brand_tone'])->toBe('#556633');
});

it('updates brand_tone without overwriting other settings', function () {
    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
        'company_name' => 'Test Company',
        'settings' => [
            'industry' => 'Technology',
            'services_needed' => 'SEO, Dev Ops',
        ],
    ]);

    $service = new OnboardingService;

    $service->updateCompanyInfo($tenant, [
        'brand_tone' => 'Modern and Professional',
    ]);

    $tenant->refresh();

    expect($tenant->settings['brand_tone'])->toBe('Modern and Professional');
    expect($tenant->settings['industry'])->toBe('Technology');
    expect($tenant->settings['services_needed'])->toBe('SEO, Dev Ops');
});

it('saves multiple company info fields including brand_tone', function () {
    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
        'company_name' => 'Old Company',
        'settings' => [],
    ]);

    $service = new OnboardingService;

    $service->updateCompanyInfo($tenant, [
        'company_name' => 'New Company',
        'industry' => 'Insurance',
        'services_needed' => 'LinkedIn, Video editing',
        'brand_tone' => 'Professional and Trustworthy',
    ]);

    $tenant->refresh();

    expect($tenant->company_name)->toBe('New Company');
    expect($tenant->settings['industry'])->toBe('Insurance');
    expect($tenant->settings['services_needed'])->toBe('LinkedIn, Video editing');
    expect($tenant->settings['brand_tone'])->toBe('Professional and Trustworthy');
});

it('preserves existing brand_tone when updating other fields', function () {
    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
        'company_name' => 'Test Company',
        'settings' => [
            'brand_tone' => 'Existing Tone',
        ],
    ]);

    $service = new OnboardingService;

    $service->updateCompanyInfo($tenant, [
        'industry' => 'Technology',
    ]);

    $tenant->refresh();

    expect($tenant->settings['brand_tone'])->toBe('Existing Tone');
    expect($tenant->settings['industry'])->toBe('Technology');
});
