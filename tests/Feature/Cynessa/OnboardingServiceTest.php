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

    $service = app(OnboardingService::class);

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

    $service = app(OnboardingService::class);

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

    $service = app(OnboardingService::class);

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

    $service = app(OnboardingService::class);

    $service->updateCompanyInfo($tenant, [
        'industry' => 'Technology',
    ]);

    $tenant->refresh();

    expect($tenant->settings['brand_tone'])->toBe('Existing Tone');
    expect($tenant->settings['industry'])->toBe('Technology');
});

it('cannot complete onboarding without brand_tone', function () {
    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
        'company_name' => 'Test Company',
        'settings' => [
            'industry' => 'Technology',
            'services_needed' => 'SEO, Dev Ops',
            'brand_assets' => [
                ['filename' => 'logo.png', 'path' => 'path/to/logo.png', 'type' => 'logo'],
            ],
        ],
    ]);

    $service = app(OnboardingService::class);

    expect($service->canComplete($tenant))->toBeFalse();
});

it('can complete onboarding with all required fields including brand_tone', function () {
    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
        'company_name' => 'Test Company',
        'settings' => [
            'industry' => 'Technology',
            'services_needed' => 'SEO, Dev Ops',
            'brand_tone' => 'Modern and Professional',
            'brand_assets' => [
                ['filename' => 'logo.png', 'path' => 'path/to/logo.png', 'type' => 'logo'],
            ],
        ],
    ]);

    $service = app(OnboardingService::class);

    expect($service->canComplete($tenant))->toBeTrue();
});

it('company_info step is not completed without brand_tone', function () {
    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
        'company_name' => 'Test Company',
        'settings' => [
            'industry' => 'Technology',
            'services_needed' => 'SEO, Dev Ops',
        ],
    ]);

    $service = app(OnboardingService::class);
    $progress = $service->getProgress($tenant);

    expect($progress['steps']['company_info']['completed'])->toBeFalse();
});

it('company_info step is completed with brand_tone', function () {
    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
        'company_name' => 'Test Company',
        'settings' => [
            'industry' => 'Technology',
            'services_needed' => 'SEO, Dev Ops',
            'brand_tone' => 'Modern and Professional',
        ],
    ]);

    $service = app(OnboardingService::class);
    $progress = $service->getProgress($tenant);

    expect($progress['steps']['company_info']['completed'])->toBeTrue();
});

it('can reset onboarding for a completed tenant', function () {
    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
        'company_name' => 'Test Company',
        'onboarding_completed_at' => now(),
        'settings' => [
            'industry' => 'Technology',
            'services_needed' => 'SEO, Dev Ops',
            'brand_tone' => 'Modern and Professional',
            'brand_assets' => [
                ['filename' => 'logo.png', 'path' => 'path/to/logo.png', 'type' => 'logo'],
            ],
        ],
    ]);

    $service = app(OnboardingService::class);

    expect($service->isComplete($tenant))->toBeTrue();

    $service->resetOnboarding($tenant);
    $tenant->refresh();

    // Onboarding should be marked as incomplete, company name cleared, and settings cleared
    expect($service->isComplete($tenant))->toBeFalse();
    expect($tenant->company_name)->toBe('');
    expect($tenant->onboarding_completed_at)->toBeNull();
    expect($tenant->settings)->toBeEmpty();
});
