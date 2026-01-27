<?php

namespace App\Http\Controllers\Api\Portal;

use App\Http\Controllers\Controller;
use App\Models\CustomerSubscription;
use App\Models\PortalTenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PortalBillingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['subscriptions' => []]);
        }

        $tenant = PortalTenant::forUser($user);
        if (! $tenant) {
            return response()->json(['subscriptions' => []]);
        }

        $subscriptions = CustomerSubscription::query()
            ->where('tenant_id', $tenant->id)
            ->where('status', 'active')
            ->orderByDesc('end_date')
            ->get([
                'id',
                'status',
                'tier',
                'start_date',
                'end_date',
                'auto_renew',
            ]);

        return response()->json([
            'subscriptions' => $subscriptions,
        ]);
    }
}
