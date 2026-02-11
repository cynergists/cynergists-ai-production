<?php

namespace App\Services;

use App\Models\AgentAccess;
use App\Models\CustomerSubscription;
use App\Models\PortalAvailableAgent;
use App\Models\PortalTenant;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AgentAttachmentService
{
    /**
     * Attach agents to a user's portal tenant.
     *
     * @param  string  $email  User email
     * @param  array<string>|null  $agentNames  Specific agent names to attach, or null for all active agents
     * @param  string|null  $companyName  Optional company name for new tenant
     * @param  string|null  $subdomain  Optional subdomain for new tenant
     * @param  array<array{name: string, billing_type: string, square_subscription_id: ?string, square_card_id: ?string, payment_id: ?string}>|null  $agentSubscriptionData  Per-agent subscription metadata from payment processing
     * @return array{success: bool, tenant_id: string|null, agents_attached: int, message: string}
     */
    public function attachAgentsToUser(
        string $email,
        ?array $agentNames = null,
        ?string $companyName = null,
        ?string $subdomain = null,
        ?array $agentSubscriptionData = null,
    ): array {
        try {
            return DB::transaction(function () use ($email, $agentNames, $companyName, $subdomain, $agentSubscriptionData) {
                $user = User::query()->where('email', $email)->first();
                if (! $user) {
                    return [
                        'success' => false,
                        'tenant_id' => null,
                        'agents_attached' => 0,
                        'message' => "User not found with email: {$email}",
                    ];
                }

                // Get or create tenant
                $tenant = $this->getOrCreateTenant($user, $companyName, $subdomain);

                // Index subscription data by agent name for fast lookup
                $subscriptionDataByName = [];
                if ($agentSubscriptionData) {
                    foreach ($agentSubscriptionData as $data) {
                        $subscriptionDataByName[$data['name']] = $data;
                    }
                }

                // Build query for available agents
                $agentsQuery = PortalAvailableAgent::query()->where('is_active', true);

                // Filter by specific agent names if provided
                if ($agentNames !== null && ! empty($agentNames)) {
                    $agentsQuery->whereIn('name', $agentNames);
                }

                $agents = $agentsQuery->orderBy('sort_order')->get();

                // When no per-agent data, use shared subscription (legacy behavior)
                $sharedSubscription = null;
                if (! $agentSubscriptionData) {
                    $sharedSubscription = $this->getOrCreateSubscription($tenant);
                }

                $attachedCount = 0;
                $newlyAttachedAgents = [];

                foreach ($agents as $available) {
                    $agentData = $subscriptionDataByName[$available->name] ?? null;

                    // Create per-agent subscription if subscription data is provided
                    $subscription = $sharedSubscription;
                    if ($agentData) {
                        $subscription = $this->createAgentSubscription($tenant, $available, $agentData);
                    } elseif (! $subscription) {
                        $subscription = $this->getOrCreateSubscription($tenant);
                    }

                    $access = AgentAccess::query()
                        ->where('tenant_id', $tenant->id)
                        ->where('agent_name', $available->name)
                        ->first();

                    $payload = [
                        'subscription_id' => $subscription->id,
                        'customer_id' => $tenant->id,
                        'agent_type' => $available->category ?: 'general',
                        'agent_name' => $available->name,
                        'configuration' => $access?->configuration ?? [],
                        'is_active' => true,
                        'usage_count' => $access?->usage_count ?? 0,
                        'usage_limit' => $access?->usage_limit,
                        'last_used_at' => $access?->last_used_at,
                        'tenant_id' => $tenant->id,
                    ];

                    if ($access) {
                        $access->fill($payload)->save();
                    } else {
                        AgentAccess::query()->create(array_merge($payload, [
                            'id' => (string) Str::uuid(),
                        ]));
                        $newlyAttachedAgents[] = $available;
                    }

                    $attachedCount++;
                }

                $eventEmailService = app(EventEmailService::class);
                foreach ($newlyAttachedAgents as $newAgent) {
                    $eventEmailService->fire('subscription_started', [
                        'user' => $user,
                        'agent' => $newAgent,
                        'subscription' => $sharedSubscription ?? CustomerSubscription::query()
                            ->where('tenant_id', $tenant->id)
                            ->where('status', 'active')
                            ->first(),
                        'tenant' => $tenant,
                    ]);
                }

                Log::info('Agents attached to user tenant', [
                    'user_email' => $email,
                    'tenant_id' => $tenant->id,
                    'agents_attached' => $attachedCount,
                    'agent_names' => $agentNames ?? 'all active',
                    'has_subscription_data' => $agentSubscriptionData !== null,
                ]);

                return [
                    'success' => true,
                    'tenant_id' => $tenant->id,
                    'agents_attached' => $attachedCount,
                    'message' => "Successfully attached {$attachedCount} agent(s) to {$email}",
                ];
            });
        } catch (\Exception $e) {
            Log::error('Failed to attach agents to user', [
                'email' => $email,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'tenant_id' => null,
                'agents_attached' => 0,
                'message' => "Failed to attach agents: {$e->getMessage()}",
            ];
        }
    }

    /**
     * Get existing tenant or create a new one for the user.
     */
    private function getOrCreateTenant(User $user, ?string $companyName, ?string $subdomain): PortalTenant
    {
        $tenant = PortalTenant::forUser($user);

        if ($tenant) {
            return $tenant;
        }

        return PortalTenant::query()->create([
            'id' => (string) Str::uuid(),
            'user_id' => (string) $user->id,
            'company_name' => $companyName ?: ($user->name ?: 'Portal Client'),
            'subdomain' => $this->resolveSubdomain($user->email, $subdomain),
            'is_temp_subdomain' => false,
            'logo_url' => null,
            'primary_color' => '#22c55e',
            'settings' => [],
            'status' => 'active',
            'onboarding_completed_at' => now(),
        ]);
    }

    /**
     * Get existing active subscription or create a new one (legacy shared subscription).
     */
    private function getOrCreateSubscription(PortalTenant $tenant): CustomerSubscription
    {
        $subscription = CustomerSubscription::query()
            ->where('tenant_id', $tenant->id)
            ->where('status', 'active')
            ->first();

        if ($subscription) {
            return $subscription;
        }

        return CustomerSubscription::query()->create([
            'id' => (string) Str::uuid(),
            'customer_id' => $tenant->id,
            'product_id' => (string) Str::uuid(),
            'payment_id' => null,
            'status' => 'active',
            'tier' => 'starter',
            'start_date' => now(),
            'end_date' => now()->addYear(),
            'auto_renew' => false,
            'billing_type' => 'one_time',
            'tenant_id' => $tenant->id,
        ]);
    }

    /**
     * Create a dedicated subscription record for a specific agent.
     *
     * @param  array{name: string, billing_type: string, square_subscription_id: ?string, square_card_id: ?string, payment_id: ?string}  $agentData
     */
    private function createAgentSubscription(
        PortalTenant $tenant,
        PortalAvailableAgent $agent,
        array $agentData,
    ): CustomerSubscription {
        $isMonthly = $agentData['billing_type'] === 'monthly';

        return CustomerSubscription::query()->create([
            'id' => (string) Str::uuid(),
            'customer_id' => $tenant->id,
            'product_id' => $agent->id,
            'payment_id' => $agentData['payment_id'],
            'square_subscription_id' => $agentData['square_subscription_id'],
            'square_card_id' => $agentData['square_card_id'],
            'status' => 'active',
            'tier' => 'starter',
            'start_date' => now(),
            'end_date' => $isMonthly ? null : now()->addYear(),
            'auto_renew' => $isMonthly,
            'billing_type' => $agentData['billing_type'],
            'tenant_id' => $tenant->id,
        ]);
    }

    /**
     * Generate a unique subdomain for the tenant.
     */
    private function resolveSubdomain(string $email, ?string $subdomain): string
    {
        if ($subdomain) {
            return $subdomain;
        }

        $base = Str::slug(Str::before($email, '@'));
        if ($base === '') {
            $base = 'portal-user';
        }

        $candidate = $base.'-test';
        $suffix = 1;

        while (PortalTenant::query()->where('subdomain', $candidate)->exists()) {
            $candidate = $base.'-test-'.$suffix;
            $suffix++;
        }

        return $candidate;
    }
}
