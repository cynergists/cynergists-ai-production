<?php

namespace App\Http\Controllers\Api\Portal;

use App\Http\Controllers\Controller;
use App\Http\Requests\Portal\BrandKitRequest;
use App\Models\PortalTenant;
use App\Services\Portal\AgentOnboardingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BrandKitController extends Controller
{
    public function __construct(
        private AgentOnboardingService $agentOnboardingService
    ) {}

    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['brand_kit' => null], 401);
        }

        $tenant = PortalTenant::forUser($user);
        if (! $tenant) {
            return response()->json(['brand_kit' => null], 404);
        }

        $settings = $tenant->settings ?? [];

        return response()->json([
            'brand_kit' => $settings['brand_kit'] ?? [],
            'brand_assets' => $settings['brand_assets'] ?? [],
        ]);
    }

    public function update(BrandKitRequest $request): JsonResponse
    {
        $user = $request->user();

        $tenant = PortalTenant::forUser($user);
        if (! $tenant) {
            return response()->json(['success' => false], 404);
        }

        // Only the tenant owner or an admin may update the brand kit
        abort_unless(
            $user->hasRole('admin') || (string) $tenant->user_id === (string) $user->id,
            403,
            'Only the account owner or an admin may update the Brand Kit.'
        );

        $settings = $tenant->settings ?? [];

        $tenant->update([
            'settings' => array_merge($settings, [
                'brand_kit' => array_merge(
                    $settings['brand_kit'] ?? [],
                    $request->validated()
                ),
            ]),
        ]);

        $this->agentOnboardingService->log($tenant, null, 'brand_kit_updated', $user, [
            'fields' => array_keys($request->validated()),
        ]);

        return response()->json([
            'success' => true,
            'brand_kit' => $tenant->fresh()->settings['brand_kit'] ?? [],
        ]);
    }
}
