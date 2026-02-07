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
     * @return array{success: bool, tenant_id: string|null, agents_attached: int, message: string}
     */
    public function attachAgentsToUser(
        string $email,
        ?array $agentNames = null,
        ?string $companyName = null,
        ?string $subdomain = null
    ): array {
        try {
            return DB::transaction(function () use ($email, $agentNames, $companyName, $subdomain) {
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

                // Get or create subscription
                $subscription = $this->getOrCreateSubscription($tenant);

                // Build query for available agents
                $agentsQuery = PortalAvailableAgent::query()->where('is_active', true);

                // Filter by specific agent names if provided
                if ($agentNames !== null && ! empty($agentNames)) {
                    $agentsQuery->whereIn('name', $agentNames);
                }

                $agents = $agentsQuery->orderBy('sort_order')->get();

                $attachedCount = 0;
                $newlyAttachedAgents = [];

                foreach ($agents as $available) {
                    $access = AgentAccess::query()
                        ->where('tenant_id', $tenant->id)
                        ->where('agent_name', $available->name)
                        ->first();

                    $payload = [
                        'subscription_id' => $access?->subscription_id ?? $subscription->id,
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
                        'subscription' => $subscription,
                        'tenant' => $tenant,
                    ]);
                }

                Log::info('Agents attached to user tenant', [
                    'user_email' => $email,
                    'tenant_id' => $tenant->id,
                    'agents_attached' => $attachedCount,
                    'agent_names' => $agentNames ?? 'all active',
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
     * Get existing active subscription or create a new one.
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
