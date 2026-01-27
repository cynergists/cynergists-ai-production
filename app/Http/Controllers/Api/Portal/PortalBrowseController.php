<?php

namespace App\Http\Controllers\Api\Portal;

use App\Http\Controllers\Controller;
use App\Models\AgentAccess;
use App\Models\PortalAvailableAgent;
use App\Models\PortalTenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PortalBrowseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $agents = PortalAvailableAgent::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        $ownedAgentNames = [];
        $user = $request->user();
        if ($user) {
            $tenant = PortalTenant::forUser($user);
            if ($tenant) {
                $ownedAgentNames = AgentAccess::query()
                    ->where('tenant_id', $tenant->id)
                    ->where('is_active', true)
                    ->pluck('agent_name')
                    ->all();
            }
        }

        return response()->json([
            'agents' => $agents,
            'ownedAgentNames' => $ownedAgentNames,
        ]);
    }
}
