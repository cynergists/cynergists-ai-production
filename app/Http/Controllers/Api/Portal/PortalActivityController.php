<?php

namespace App\Http\Controllers\Api\Portal;

use App\Http\Controllers\Controller;
use App\Models\AgentAccess;
use App\Models\AgentConversation;
use App\Models\PortalTenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PortalActivityController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json([
                'conversations' => [],
                'agentStats' => [],
            ]);
        }

        $tenant = PortalTenant::forUser($user);
        if (! $tenant) {
            return response()->json([
                'conversations' => [],
                'agentStats' => [],
            ]);
        }

        $conversations = AgentConversation::query()
            ->with('access:id,agent_name,agent_type')
            ->where('tenant_id', $tenant->id)
            ->orderByDesc('updated_at')
            ->limit(20)
            ->get(['id', 'title', 'status', 'created_at', 'updated_at', 'agent_access_id']);

        $agentStats = AgentAccess::query()
            ->where('tenant_id', $tenant->id)
            ->where('is_active', true)
            ->orderByDesc('usage_count')
            ->get(['id', 'agent_name', 'usage_count', 'last_used_at']);

        return response()->json([
            'conversations' => $conversations,
            'agentStats' => $agentStats,
        ]);
    }
}
