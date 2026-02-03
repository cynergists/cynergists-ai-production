<?php

namespace App\Services\Cynessa;

use App\Models\PortalTenant;
use App\Models\User;

class OnboardingService
{
    /**
     * Check if tenant has completed onboarding.
     */
    public function isComplete(PortalTenant $tenant): bool
    {
        return $tenant->onboarding_completed_at !== null;
    }

    /**
     * Get onboarding progress for a tenant.
     *
     * @return array{
     *     completed: bool,
     *     steps: array,
     *     percentComplete: int
     * }
     */
    public function getProgress(PortalTenant $tenant): array
    {
        $steps = [
            'company_info' => [
                'name' => 'Company Information',
                'completed' => ! empty($tenant->company_name),
            ],
            'brand_assets' => [
                'name' => 'Brand Assets',
                'completed' => $this->hasBrandAssets($tenant),
            ],
        ];

        $completedSteps = collect($steps)->filter(fn ($step) => $step['completed'])->count();
        $totalSteps = count($steps);
        $percentComplete = $totalSteps > 0 ? (int) (($completedSteps / $totalSteps) * 100) : 0;

        return [
            'completed' => $this->isComplete($tenant),
            'steps' => $steps,
            'percentComplete' => $percentComplete,
        ];
    }

    /**
     * Update company information.
     */
    public function updateCompanyInfo(PortalTenant $tenant, array $data): void
    {
        $settings = $tenant->settings ?? [];

        $tenant->update([
            'company_name' => $data['company_name'] ?? $tenant->company_name,
            'settings' => array_merge($settings, [
                'industry' => $data['industry'] ?? ($settings['industry'] ?? null),
                'company_size' => $data['company_size'] ?? ($settings['company_size'] ?? null),
                'goals' => $data['goals'] ?? ($settings['goals'] ?? null),
                'services_needed' => $data['services_needed'] ?? ($settings['services_needed'] ?? null),
                'brand_tone' => $data['brand_tone'] ?? ($settings['brand_tone'] ?? null),
            ]),
        ]);
    }

    /**
     * Check if onboarding can be marked complete.
     * All required info must be collected.
     */
    public function canComplete(PortalTenant $tenant): bool
    {
        $settings = $tenant->settings ?? [];

        return ! empty($tenant->company_name)
            && ! empty($settings['industry'])
            && ! empty($settings['services_needed'])
            && $this->hasBrandAssets($tenant);
    }

    /**
     * Mark onboarding as complete.
     */
    public function markComplete(PortalTenant $tenant): void
    {
        if (! $this->isComplete($tenant)) {
            $tenant->update([
                'onboarding_completed_at' => now(),
            ]);
        }
    }

    /**
     * Track uploaded brand asset files.
     */
    public function trackBrandAsset(PortalTenant $tenant, string $filename, string $path, string $type): void
    {
        $settings = $tenant->settings ?? [];
        $brandAssets = $settings['brand_assets'] ?? [];

        $brandAssets[] = [
            'filename' => $filename,
            'path' => $path,
            'type' => $type,
            'uploaded_at' => now()->toIso8601String(),
        ];

        $tenant->update([
            'settings' => array_merge($settings, [
                'brand_assets' => $brandAssets,
            ]),
        ]);
    }

    /**
     * Update the type of a specific brand asset file.
     */
    public function updateBrandAssetType(PortalTenant $tenant, string $filename, string $type): void
    {
        $settings = $tenant->settings ?? [];
        $brandAssets = $settings['brand_assets'] ?? [];

        // Find and update the matching file
        foreach ($brandAssets as $index => $asset) {
            if ($asset['filename'] === $filename) {
                $brandAssets[$index]['type'] = $type;
                break;
            }
        }

        $tenant->update([
            'settings' => array_merge($settings, [
                'brand_assets' => $brandAssets,
            ]),
        ]);
    }

    /**
     * Check if tenant has uploaded brand assets.
     */
    public function hasBrandAssets(PortalTenant $tenant): bool
    {
        $settings = $tenant->settings ?? [];
        $brandAssets = $settings['brand_assets'] ?? [];

        return count($brandAssets) > 0;
    }

    /**
     * Create Google Drive folder for tenant.
     * TODO: Implement Google Drive integration
     */
    public function createDriveFolder(PortalTenant $tenant): ?string
    {
        // Placeholder for Google Drive integration
        return null;
    }

    /**
     * Sync tenant data to CRM (GoHighLevel).
     * TODO: Implement GoHighLevel integration
     */
    public function syncToCRM(PortalTenant $tenant, User $user): void
    {
        // Placeholder for GoHighLevel integration
    }
}
