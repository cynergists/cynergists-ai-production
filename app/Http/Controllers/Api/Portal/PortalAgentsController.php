<?php

namespace App\Http\Controllers\Api\Portal;

use App\Http\Controllers\Controller;
use App\Http\Requests\Portal\UpdateAgentConfigurationRequest;
use App\Models\AgentAccess;
use App\Models\PortalTenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PortalAgentsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['agents' => []]);
        }

        $tenant = PortalTenant::forUser($user);
        if (! $tenant) {
            return response()->json(['agents' => []]);
        }

        $agents = AgentAccess::query()
            ->with('subscription:id,status,tier,end_date')
            ->where('tenant_id', $tenant->id)
            ->where('is_active', true)
            ->orderByDesc('created_at')
            ->get([
                'id',
                'agent_type',
                'agent_name',
                'configuration',
                'is_active',
                'usage_count',
                'usage_limit',
                'last_used_at',
                'created_at',
                'subscription_id',
            ]);

        return response()->json([
            'agents' => $agents,
        ]);
    }

    public function show(Request $request, string $agent): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['agent' => null], 401);
        }

        $tenant = PortalTenant::forUser($user);
        if (! $tenant) {
            return response()->json(['agent' => null], 404);
        }

        $agentAccess = AgentAccess::query()
            ->where('tenant_id', $tenant->id)
            ->where('id', $agent)
            ->first();

        if (! $agentAccess) {
            return response()->json(['agent' => null], 404);
        }

        return response()->json([
            'agent' => $agentAccess,
        ]);
    }

    public function updateConfiguration(UpdateAgentConfigurationRequest $request, string $agent): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['agent' => null], 401);
        }

        $tenant = PortalTenant::forUser($user);
        if (! $tenant) {
            return response()->json(['agent' => null], 404);
        }

        $agentAccess = AgentAccess::query()
            ->where('tenant_id', $tenant->id)
            ->where('id', $agent)
            ->first();

        if (! $agentAccess) {
            return response()->json(['agent' => null], 404);
        }

        $agentAccess->configuration = $request->validated('configuration');
        $agentAccess->save();

        return response()->json([
            'success' => true,
            'agent' => $agentAccess,
        ]);
    }
}
