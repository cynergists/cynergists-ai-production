<?php

namespace App\Services\Cynessa;

use App\Models\PortalTenant;
use App\Models\User;
use App\Services\GoHighLevelService;
use App\Services\GoogleDriveService;
use App\Services\Portal\AgentOnboardingService;
use Illuminate\Support\Facades\Log;

class OnboardingService
{
    public function __construct(
        private GoogleDriveService $googleDriveService,
        private GoHighLevelService $goHighLevelService,
        private AgentOnboardingService $agentOnboardingService
    ) {}

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
        $settings = $tenant->settings ?? [];

        $steps = [
            'company_info' => [
                'name' => 'Company Information',
                'completed' => ! empty($tenant->company_name)
                    && ! empty($settings['industry'])
                    && ! empty($settings['services_needed'])
                    && ! empty($settings['brand_tone']),
            ],
            'brand_assets' => [
                'name' => 'Brand Assets',
                'completed' => $this->hasBrandAssets($tenant),
            ],
            'team_intro' => [
                'name' => 'Team Introductions',
                'completed' => $this->isComplete($tenant), // Mark as complete when onboarding is done
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
                'website' => $data['website'] ?? ($settings['website'] ?? null),
                'business_description' => $data['business_description'] ?? ($settings['business_description'] ?? null),
                'brand_colors' => $data['brand_colors'] ?? ($settings['brand_colors'] ?? null),
            ]),
        ]);
    }

    /**
     * Check if onboarding can be marked complete.
     * All required info must be collected.
     * Note: Brand assets are optional - nice to have but not required.
     */
    public function canComplete(PortalTenant $tenant): bool
    {
        $settings = $tenant->settings ?? [];

        return ! empty($tenant->company_name)
            && ! empty($settings['industry'])
            && ! empty($settings['services_needed'])
            && ! empty($settings['brand_tone']);
        // Brand assets are optional - removed from requirements
    }

    /**
     * Mark onboarding as complete.
     * Only marks complete if all requirements are met.
     */
    public function markComplete(PortalTenant $tenant, ?User $user = null): void
    {
        // Double-check requirements before marking complete
        if (! $this->isComplete($tenant) && $this->canComplete($tenant)) {
            $tenant->update([
                'onboarding_completed_at' => now(),
            ]);

            // Also mark Iris onboarding complete in the new tracking table
            if ($user) {
                $this->agentOnboardingService->markCompleted($tenant, 'iris', $user);
            }

            \Log::info('Onboarding marked complete', [
                'tenant_id' => $tenant->id,
                'user_id' => $tenant->user_id,
                'company_name' => $tenant->company_name,
            ]);
        } elseif (! $this->canComplete($tenant)) {
            \Log::warning('Attempted to mark onboarding complete but requirements not met', [
                'tenant_id' => $tenant->id,
                'user_id' => $tenant->user_id,
                'has_company_name' => ! empty($tenant->company_name),
                'has_industry' => ! empty(($tenant->settings ?? [])['industry'] ?? null),
                'has_services' => ! empty(($tenant->settings ?? [])['services_needed'] ?? null),
                'has_brand_tone' => ! empty(($tenant->settings ?? [])['brand_tone'] ?? null),
                'has_assets' => $this->hasBrandAssets($tenant),
            ]);
        }
    }

    /**
     * Reset onboarding to start over from the beginning.
     * Clears all onboarding data so user can start fresh.
     */
    public function resetOnboarding(PortalTenant $tenant): void
    {
        $tenant->update([
            'company_name' => '',
            'onboarding_completed_at' => null,
            'settings' => [],
        ]);
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
     * Create Google Drive folder for tenant and store the folder ID.
     */
    public function createDriveFolder(PortalTenant $tenant): ?string
    {
        try {
            $folderId = $this->googleDriveService->createClientFolder(
                $tenant->company_name ?: 'Unknown Company',
                $tenant->id
            );

            if ($folderId) {
                $settings = $tenant->settings ?? [];
                $tenant->update([
                    'settings' => array_merge($settings, [
                        'google_drive_folder_id' => $folderId,
                    ]),
                ]);

                Log::info('Google Drive folder created for tenant', [
                    'tenant_id' => $tenant->id,
                    'folder_id' => $folderId,
                ]);
            }

            return $folderId;
        } catch (\Exception $e) {
            Log::error('Failed to create Google Drive folder', [
                'tenant_id' => $tenant->id,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Sync tenant data to CRM (GoHighLevel) and store the contact ID.
     */
    public function syncToCRM(PortalTenant $tenant, User $user): void
    {
        try {
            $contactId = $this->goHighLevelService->createOrUpdateContact($tenant, $user);

            if ($contactId) {
                $settings = $tenant->settings ?? [];
                $tenant->update([
                    'settings' => array_merge($settings, [
                        'ghl_contact_id' => $contactId,
                    ]),
                ]);

                Log::info('GoHighLevel contact synced for tenant', [
                    'tenant_id' => $tenant->id,
                    'contact_id' => $contactId,
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to sync to GoHighLevel', [
                'tenant_id' => $tenant->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
