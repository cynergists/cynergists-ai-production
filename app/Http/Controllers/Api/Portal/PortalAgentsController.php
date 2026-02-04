<?php

namespace App\Http\Controllers\Api\Portal;

use App\Http\Controllers\Controller;
use App\Http\Requests\Portal\UpdateAgentConfigurationRequest;
use App\Models\AgentAccess;
use App\Models\PortalAvailableAgent;
use App\Models\PortalTenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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

        // Get avatars from portal_available_agents
        $agentNames = $agents->pluck('agent_name')->unique()->toArray();
        $avatars = PortalAvailableAgent::query()
            ->whereIn('name', $agentNames)
            ->whereNotNull('avatar')
            ->pluck('avatar', 'name')
            ->toArray();

        // Add avatar_url to each agent
        $agents = $agents->map(function ($agent) use ($avatars) {
            $avatar = $avatars[$agent->agent_name] ?? null;
            $agent->avatar_url = $avatar ? Storage::disk('public')->url($avatar) : null;

            return $agent;
        });

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

        // Get avatar from portal_available_agents
        $availableAgent = PortalAvailableAgent::query()
            ->where('name', $agentAccess->agent_name)
            ->first(['avatar']);

        $agentAccess->avatar_url = $availableAgent?->avatar
            ? Storage::disk('public')->url($availableAgent->avatar)
            : null;

        // Include tenant data for sidebar display
        $agentAccess->tenant_data = $tenant;

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
