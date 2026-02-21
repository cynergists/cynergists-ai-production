<?php

namespace App\Http\Controllers\Api\Portal;

use App\Http\Controllers\Controller;
use App\Http\Requests\Portal\UpdateAgentConfigurationRequest;
use App\Models\AgentAccess;
use App\Models\PortalAvailableAgent;
use App\Models\PortalTenant;
use App\Portal\Apex\Config\ApexSidebarConfig;
use App\Portal\Briggs\Config\BriggsSidebarConfig;
use App\Portal\Carbon\Config\CarbonSidebarConfig;
use App\Portal\Luna\Config\LunaSidebarConfig;
use App\Portal\Vector\Config\VectorSidebarConfig;
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

        // Always ensure virtual agents (Cynessa, Iris) are available to all users
        $virtualAgents = PortalAvailableAgent::query()
            ->whereIn('name', ['Cynessa', 'Iris'])
            ->orderBy('sort_order')
            ->get(['id', 'name', 'avatar', 'redirect_url', 'job_title', 'is_beta', 'sort_order']);

        $virtualAgentsToAdd = collect();

        foreach ($virtualAgents as $virtualAvailableAgent) {
            $hasAgent = $agents->contains('agent_name', $virtualAvailableAgent->name);

            if (! $hasAgent) {
                $virtualAgentAccess = new AgentAccess([
                    'id' => (string) $virtualAvailableAgent->id,
                    'agent_type' => 'assistant',
                    'agent_name' => $virtualAvailableAgent->name,
                    'configuration' => null,
                    'is_active' => true,
                    'usage_count' => 0,
                    'usage_limit' => null,
                    'last_used_at' => null,
                    'created_at' => now(),
                    'subscription_id' => null,
                ]);
                $virtualAgentAccess->subscription = null;
                $virtualAgentsToAdd->push($virtualAgentAccess);
            }
        }

        $agents = $virtualAgentsToAdd->concat($agents);

        // Get avatars, redirect URLs, and job titles from portal_available_agents
        $agentNames = $agents->pluck('agent_name')->unique()->toArray();
        $availableAgents = PortalAvailableAgent::query()
            ->whereIn('name', $agentNames)
            ->get(['name', 'avatar', 'redirect_url', 'job_title', 'is_beta'])
            ->keyBy('name');

        // Add avatar_url, redirect_url, job_title, and is_beta to each agent
        $agents = $agents->map(function ($agent) use ($availableAgents) {
            $availableAgent = $availableAgents->get($agent->agent_name);
            $avatar = $availableAgent?->avatar;
            $agent->avatar_url = $avatar ? Storage::disk('public')->url($avatar) : null;
            $agent->redirect_url = $availableAgent?->redirect_url;
            $agent->job_title = $availableAgent?->job_title;
            $agent->is_beta = $availableAgent?->is_beta ?? false;

            return $agent;
        });

        return response()->json([
            'agents' => $agents->values(),
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

        // If agent not found, check if it's a virtual agent (Cynessa or Iris) by ID
        if (! $agentAccess) {
            $virtualAvailableAgent = PortalAvailableAgent::query()
                ->whereIn('name', ['Cynessa', 'Iris'])
                ->where('id', $agent)
                ->first(['id', 'name', 'avatar', 'redirect_url', 'job_title', 'is_beta']);

            if ($virtualAvailableAgent) {
                // Create a virtual agent access for the matched agent
                $agentAccess = new AgentAccess([
                    'id' => $agent,
                    'agent_type' => 'assistant',
                    'agent_name' => $virtualAvailableAgent->name,
                    'configuration' => null,
                    'is_active' => true,
                    'usage_count' => 0,
                    'usage_limit' => null,
                    'last_used_at' => null,
                    'tenant_id' => $tenant->id,
                ]);

                $agentAccess->avatar_url = $virtualAvailableAgent->avatar
                    ? Storage::disk('public')->url($virtualAvailableAgent->avatar)
                    : null;
                $agentAccess->redirect_url = $virtualAvailableAgent->redirect_url;
                $agentAccess->job_title = $virtualAvailableAgent->job_title;
                $agentAccess->is_beta = $virtualAvailableAgent->is_beta ?? false;
                $agentAccess->tenant_data = $tenant;

                // Include Carbon-specific SEO data for sidebar
                if (strtolower($agentAccess->agent_name) === 'carbon') {
                    $agentAccess->seo_data = CarbonSidebarConfig::getConfig($tenant);
                }

                // Include Luna-specific image gallery data for sidebar
                if (strtolower($agentAccess->agent_name) === 'luna') {
                    $agentAccess->luna_data = LunaSidebarConfig::getConfig($tenant);
                }

                // Include Apex-specific LinkedIn data for sidebar
                if (strtolower($agentAccess->agent_name) === 'apex') {
                    $agentAccess->apex_data = ApexSidebarConfig::getConfig($tenant);
                }

                // Include Briggs-specific training data for sidebar
                if (strtolower($agentAccess->agent_name) === 'briggs') {
                    $agentAccess->briggs_data = BriggsSidebarConfig::getConfig($tenant);
                }

                // Include Vector-specific media buying data for sidebar
                if (strtolower($agentAccess->agent_name) === 'vector') {
                    $agentAccess->vector_data = VectorSidebarConfig::getConfig($tenant);
                }

                return response()->json([
                    'agent' => $agentAccess,
                ]);
            }

            return response()->json(['agent' => null], 404);
        }

        // Get avatar, redirect URL, job title, and is_beta from portal_available_agents
        $availableAgent = PortalAvailableAgent::query()
            ->where('name', $agentAccess->agent_name)
            ->first(['avatar', 'redirect_url', 'job_title', 'is_beta']);

        $agentAccess->avatar_url = $availableAgent?->avatar
            ? Storage::disk('public')->url($availableAgent->avatar)
            : null;
        $agentAccess->redirect_url = $availableAgent?->redirect_url;
        $agentAccess->job_title = $availableAgent?->job_title;
        $agentAccess->is_beta = $availableAgent?->is_beta ?? false;

        // Include tenant data for sidebar display
        $agentAccess->tenant_data = $tenant;

        // Include Carbon-specific SEO data for sidebar
        if (strtolower($agentAccess->agent_name) === 'carbon') {
            $agentAccess->seo_data = CarbonSidebarConfig::getConfig($tenant);
        }

        // Include Luna-specific image gallery data for sidebar
        if (strtolower($agentAccess->agent_name) === 'luna') {
            $agentAccess->luna_data = LunaSidebarConfig::getConfig($tenant);
        }

        // Include Apex-specific LinkedIn data for sidebar
        if (strtolower($agentAccess->agent_name) === 'apex') {
            $agentAccess->apex_data = ApexSidebarConfig::getConfig($tenant);
        }

        // Include Briggs-specific training data for sidebar
        if (strtolower($agentAccess->agent_name) === 'briggs') {
            $agentAccess->briggs_data = BriggsSidebarConfig::getConfig($tenant);
        }

        // Include Vector-specific media buying data for sidebar
        if (strtolower($agentAccess->agent_name) === 'vector') {
            $agentAccess->vector_data = VectorSidebarConfig::getConfig($tenant);
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
