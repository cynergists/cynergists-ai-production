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
use Illuminate\Support\Str;

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

        // Always ensure Iris is available to all users (pinned first)
        // Use a deterministic ID so conversation history persists across page refreshes
        $irisAgent = new AgentAccess([
            'id' => 'iris-'.$tenant->id,
            'agent_type' => 'iris',
            'agent_name' => 'Iris',
            'configuration' => null,
            'is_active' => true,
            'usage_count' => 0,
            'usage_limit' => null,
            'last_used_at' => null,
            'created_at' => now(),
            'subscription_id' => null,
        ]);
        $irisAgent->subscription = null;
        $irisAgent->avatar_url = null;
        $irisAgent->redirect_url = null;
        $irisAgent->job_title = 'Onboarding Guide';
        $irisAgent->is_beta = false;

        // Always ensure Cynessa is available to all users
        $cynessaAvailable = PortalAvailableAgent::query()
            ->where('name', 'Cynessa')
            ->first(['name', 'avatar', 'redirect_url', 'job_title', 'is_beta']);

        if ($cynessaAvailable) {
            // Check if user already has Cynessa access
            $hasCynessa = $agents->contains('agent_name', 'Cynessa');

            if (! $hasCynessa) {
                // Create a virtual agent access for Cynessa
                $cynessaAgent = new AgentAccess([
                    'id' => (string) Str::uuid(),
                    'agent_type' => 'assistant',
                    'agent_name' => 'Cynessa',
                    'configuration' => null,
                    'is_active' => true,
                    'usage_count' => 0,
                    'usage_limit' => null,
                    'last_used_at' => null,
                    'created_at' => now(),
                    'subscription_id' => null,
                ]);
                $cynessaAgent->subscription = null;

                // Prepend Cynessa to the collection (Iris goes before it below)
                $agents = collect([$cynessaAgent])->concat($agents);
            } else {
                // Move Cynessa to the front if she exists
                $cynessa = $agents->where('agent_name', 'Cynessa')->first();
                $agents = $agents->reject(fn ($agent) => $agent->agent_name === 'Cynessa');
                $agents = collect([$cynessa])->concat($agents);
            }
        }

        // Prepend Iris before everything else
        $agents = collect([$irisAgent])->concat($agents);

        // Get avatars, redirect URLs, and job titles from portal_available_agents
        $agentNames = $agents->pluck('agent_name')->unique()->toArray();
        $availableAgents = PortalAvailableAgent::query()
            ->whereIn('name', $agentNames)
            ->get(['name', 'avatar', 'redirect_url', 'job_title', 'is_beta'])
            ->keyBy('name');

        // Add avatar_url, redirect_url, job_title, and is_beta to each agent
        // Skip Iris — its metadata is already set above as a virtual agent
        $agents = $agents->map(function ($agent) use ($availableAgents) {
            if (strtolower($agent->agent_name) === 'iris') {
                return $agent;
            }

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

        // If agent not found, check if it's Cynessa (always available)
        if (! $agentAccess) {
            // Check if the ID matches a virtual Cynessa agent pattern or if we can find Cynessa
            $cynessaAvailable = PortalAvailableAgent::query()
                ->where('name', 'Cynessa')
                ->first(['name', 'avatar', 'redirect_url', 'job_title', 'is_beta']);

            if ($cynessaAvailable) {
                // Create a virtual agent access for Cynessa
                $agentAccess = new AgentAccess([
                    'id' => $agent,
                    'agent_type' => 'assistant',
                    'agent_name' => 'Cynessa',
                    'configuration' => null,
                    'is_active' => true,
                    'usage_count' => 0,
                    'usage_limit' => null,
                    'last_used_at' => null,
                    'tenant_id' => $tenant->id,
                ]);

                $agentAccess->avatar_url = $cynessaAvailable->avatar
                    ? Storage::disk('public')->url($cynessaAvailable->avatar)
                    : null;
                $agentAccess->redirect_url = $cynessaAvailable->redirect_url;
                $agentAccess->job_title = $cynessaAvailable->job_title;
                $agentAccess->is_beta = $cynessaAvailable->is_beta ?? false;
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
