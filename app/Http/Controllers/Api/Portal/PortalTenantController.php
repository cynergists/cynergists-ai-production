<?php

namespace App\Http\Controllers\Api\Portal;

use App\Http\Controllers\Controller;
use App\Models\PortalTenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PortalTenantController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['tenant' => null]);
        }

        $tenant = PortalTenant::forUser($user);

        return response()->json([
            'tenant' => $tenant,
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $tenant = PortalTenant::forUser($user);
        if (! $tenant) {
            return response()->json(['success' => false, 'message' => 'Tenant not found'], 404);
        }

        $validated = $request->validate([
            'company_name' => ['nullable', 'string', 'max:255'],
            'settings.website' => ['nullable', 'url', 'max:500'],
            'settings.industry' => ['nullable', 'string', 'max:255'],
            'settings.business_description' => ['nullable', 'string', 'max:2000'],
            'settings.services_needed' => ['nullable', 'string', 'max:1000'],
            'settings.brand_tone' => ['nullable', 'string', 'max:255'],
            'settings.brand_colors' => ['nullable', 'string', 'max:500'],
        ]);

        if (isset($validated['company_name'])) {
            $tenant->company_name = $validated['company_name'];
        }

        if (isset($validated['settings'])) {
            $settings = $tenant->settings ?? [];
            $tenant->settings = array_merge($settings, $validated['settings']);
        }

        $tenant->save();

        return response()->json([
            'success' => true,
            'tenant' => $tenant->fresh(),
        ]);
    }

    public function showBySubdomain(Request $request): JsonResponse
    {
        $subdomain = strtolower((string) $request->query('subdomain', ''));
        if ($subdomain === '') {
            return response()->json(['tenant' => null], 422);
        }

        $tenant = PortalTenant::forSubdomain($subdomain);

        return response()->json([
            'tenant' => $tenant,
        ]);
    }
}
