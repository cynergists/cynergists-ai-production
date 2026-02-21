<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\PortalTenant;
use App\Services\Portal\AgentOnboardingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminOnboardingController extends Controller
{
    public function __construct(
        private AgentOnboardingService $agentOnboardingService
    ) {}

    /**
     * Reset an agent's onboarding state for a specific tenant (admin only).
     *
     * The `EnsureAdminUser` middleware on this route group enforces admin access.
     */
    public function reset(Request $request, PortalTenant $tenant, string $agentName): JsonResponse
    {
        $user = $request->user();

        $this->agentOnboardingService->reset($tenant, strtolower($agentName), $user);

        // If resetting Iris, also clear the legacy onboarding_completed_at so the gate re-activates
        if (strtolower($agentName) === 'iris') {
            $tenant->update(['onboarding_completed_at' => null]);
        }

        return response()->json([
            'success' => true,
            'tenant_id' => $tenant->id,
            'agent' => strtolower($agentName),
            'state' => 'not_started',
        ]);
    }
}
