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
                'completed' => !empty($tenant->company_name),
            ],
            'brand_assets' => [
                'name' => 'Brand Assets',
                'completed' => false, // TODO: Check if files uploaded
            ],
            'team_intro' => [
                'name' => 'Team Introductions',
                'completed' => false, // TODO: Check if intro call scheduled
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
            ]),
        ]);
    }

    /**
     * Mark onboarding as complete.
     */
    public function markComplete(PortalTenant $tenant): void
    {
        if (!$this->isComplete($tenant)) {
            $tenant->update([
                'onboarding_completed_at' => now(),
            ]);
        }
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
