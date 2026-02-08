<?php

namespace App\Http\Controllers\Api\Portal;

use App\Http\Controllers\Controller;
use App\Http\Requests\Portal\UnsubscribeAgentRequest;
use App\Models\AgentAccess;
use App\Models\PortalAvailableAgent;
use App\Models\PortalTenant;
use App\Services\EventEmailService;
use App\Services\SquareSubscriptionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class PortalAccountController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['profile' => null, 'agents' => []]);
        }

        $tenant = PortalTenant::forUser($user);
        if (! $tenant) {
            return response()->json(['profile' => null, 'agents' => []]);
        }

        $profile = $user->profile;

        $agents = AgentAccess::query()
            ->with('subscription:id,status,tier,end_date,billing_type,square_subscription_id')
            ->where('tenant_id', $tenant->id)
            ->where('is_active', true)
            ->orderByDesc('created_at')
            ->get([
                'id',
                'agent_type',
                'agent_name',
                'is_active',
                'usage_count',
                'last_used_at',
                'created_at',
                'subscription_id',
            ]);

        $agentNames = $agents->pluck('agent_name')->unique()->toArray();
        $availableAgents = PortalAvailableAgent::query()
            ->whereIn('name', $agentNames)
            ->get(['name', 'avatar'])
            ->keyBy('name');

        $agents = $agents->map(function ($agent) use ($availableAgents) {
            $availableAgent = $availableAgents->get($agent->agent_name);
            $avatar = $availableAgent?->avatar;
            $agent->avatar_url = $avatar ? Storage::disk('public')->url($avatar) : null;
            $agent->billing_type = $agent->subscription?->billing_type ?? 'one_time';

            return $agent;
        });

        return response()->json([
            'profile' => $profile ? [
                'first_name' => $profile->first_name,
                'last_name' => $profile->last_name,
                'company_name' => $profile->company_name,
            ] : null,
            'agents' => $agents->values(),
        ]);
    }

    public function unsubscribe(UnsubscribeAgentRequest $request, string $agent): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['success' => false], 401);
        }

        $tenant = PortalTenant::forUser($user);
        if (! $tenant) {
            return response()->json(['success' => false], 404);
        }

        $agentAccess = AgentAccess::query()
            ->with('subscription')
            ->where('tenant_id', $tenant->id)
            ->where('id', $agent)
            ->where('is_active', true)
            ->first();

        if (! $agentAccess) {
            return response()->json(['success' => false, 'message' => 'Agent not found.'], 404);
        }

        if (strtolower($agentAccess->agent_name) === 'cynessa') {
            return response()->json(['success' => false, 'message' => 'Cynessa cannot be unsubscribed.'], 403);
        }

        $subscription = $agentAccess->subscription;
        $availableAgent = PortalAvailableAgent::query()
            ->where('name', $agentAccess->agent_name)
            ->first();

        // If this is a Square subscription, cancel via the API
        if ($subscription && $subscription->square_subscription_id) {
            try {
                $squareService = app(SquareSubscriptionService::class);
                $squareService->cancelSubscription($subscription->square_subscription_id);

                $subscription->status = 'pending_cancellation';
                $subscription->save();

                Log::info('Square subscription cancellation requested', [
                    'agent_name' => $agentAccess->agent_name,
                    'square_subscription_id' => $subscription->square_subscription_id,
                ]);

                $this->fireSubscriptionCancelled($user, $availableAgent, $subscription, $tenant);

                return response()->json([
                    'success' => true,
                    'message' => 'Subscription cancelled. Access will remain active until the end of your billing period.',
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to cancel Square subscription', [
                    'agent_name' => $agentAccess->agent_name,
                    'square_subscription_id' => $subscription->square_subscription_id,
                    'error' => $e->getMessage(),
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Failed to cancel subscription. Please try again.',
                ], 500);
            }
        }

        // For one-time/legacy subscriptions, immediately deactivate
        $agentAccess->is_active = false;
        $agentAccess->save();

        $this->fireSubscriptionCancelled($user, $availableAgent, $subscription, $tenant);

        return response()->json([
            'success' => true,
            'message' => 'Agent unsubscribed successfully.',
        ]);
    }

    private function fireSubscriptionCancelled(
        \App\Models\User $user,
        ?PortalAvailableAgent $agent,
        ?\App\Models\CustomerSubscription $subscription,
        PortalTenant $tenant,
    ): void {
        app(EventEmailService::class)->fire('subscription_cancelled', [
            'user' => $user,
            'agent' => $agent,
            'subscription' => $subscription,
            'tenant' => $tenant,
        ]);
    }
}
