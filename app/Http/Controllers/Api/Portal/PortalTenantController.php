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
