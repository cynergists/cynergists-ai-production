<?php

namespace App\Http\Controllers\Api\Portal;

use App\Http\Controllers\Controller;
use App\Models\AgentAccess;
use App\Models\AgentConversation;
use App\Models\PortalTenant;
use App\Services\Cynessa\OnboardingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PortalStatsController extends Controller
{
    public function __construct(
        private OnboardingService $onboardingService
    ) {}

    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json([
                'agentCount' => 0,
                'conversationCount' => 0,
                'totalMessages' => 0,
                'recentAgents' => [],
            ]);
        }

        $tenant = PortalTenant::forUser($user);
        if (! $tenant) {
            return response()->json([
                'agentCount' => 0,
                'conversationCount' => 0,
                'totalMessages' => 0,
                'recentAgents' => [],
            ]);
        }

        $agentsQuery = AgentAccess::query()
            ->where('tenant_id', $tenant->id)
            ->where('is_active', true);

        $agentCount = (clone $agentsQuery)->count();
        $totalMessages = (int) (clone $agentsQuery)->sum('usage_count');
        $recentAgents = (clone $agentsQuery)
            ->orderByDesc('last_used_at')
            ->limit(3)
            ->get(['id', 'agent_name', 'usage_count', 'last_used_at']);

        $conversationCount = AgentConversation::query()
            ->where('tenant_id', $tenant->id)
            ->where('status', 'active')
            ->count();

        // Get onboarding progress
        $progress = $this->onboardingService->getProgress($tenant);

        return response()->json([
            'agentCount' => $agentCount,
            'conversationCount' => $conversationCount,
            'totalMessages' => $totalMessages,
            'recentAgents' => $recentAgents,
            'onboardingProgress' => [
                'completed' => $progress['completed'],
                'percentComplete' => $progress['percentComplete'],
                'steps' => collect($progress['steps'])->map(fn($step, $key) => [
                    'id' => $key,
                    'label' => $step['name'],
                    'completed' => $step['completed'],
                ])->values()->toArray(),
            ],
        ]);
    }
}
