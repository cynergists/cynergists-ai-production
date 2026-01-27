<?php

namespace App\Http\Controllers\Api\Portal;

use App\Http\Controllers\Controller;
use App\Http\Requests\Portal\CheckSubdomainRequest;
use App\Http\Requests\Portal\ClaimSubdomainRequest;
use App\Models\PortalTenant;
use Illuminate\Http\JsonResponse;

class PortalSubdomainController extends Controller
{
    public function check(CheckSubdomainRequest $request): JsonResponse
    {
        $subdomain = strtolower((string) $request->validated('subdomain'));

        if (! preg_match('/^[a-z0-9-]+$/', $subdomain)) {
            return response()->json([
                'available' => false,
                'message' => 'Invalid format',
                'reason' => 'invalid_format',
            ]);
        }

        $exists = PortalTenant::query()->where('subdomain', $subdomain)->exists();

        return response()->json([
            'available' => ! $exists,
            'message' => $exists ? 'Already taken' : 'Available!',
            'reason' => $exists ? 'taken' : null,
        ]);
    }

    public function claim(ClaimSubdomainRequest $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['success' => false, 'error' => 'Unauthorized'], 401);
        }

        $subdomain = strtolower((string) $request->validated('subdomain'));

        $tenant = PortalTenant::forUser($user);
        if (! $tenant) {
            return response()->json(['success' => false, 'error' => 'Tenant not found'], 404);
        }

        $exists = PortalTenant::query()->where('subdomain', $subdomain)->exists();
        if ($exists && $tenant->subdomain !== $subdomain) {
            return response()->json(['success' => false, 'error' => 'Subdomain already taken'], 422);
        }

        $tenant->update([
            'subdomain' => $subdomain,
            'is_temp_subdomain' => false,
            'status' => $tenant->status ?: 'active',
            'onboarding_completed_at' => $tenant->onboarding_completed_at ?? now(),
        ]);

        return response()->json([
            'success' => true,
            'subdomain' => $tenant->subdomain,
        ]);
    }
}
