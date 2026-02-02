<?php

namespace App\Jobs;

use App\Models\AgentAccess;
use App\Models\CustomerSubscription;
use App\Models\PortalAvailableAgent;
use App\Models\PortalTenant;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Str;

class AttachPortalAgentsToUser implements ShouldQueue
{
    use Queueable;

    /**
     * @param  non-empty-string  $email
     * @param  array<string>|null  $agentNames  Optional list of specific agent names to attach. If null, attaches all active agents.
     */
    public function __construct(
        public string $email,
        public ?string $companyName = null,
        public ?string $subdomain = null,
        public ?array $agentNames = null,
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $user = User::query()->where('email', $this->email)->first();
        if (! $user) {
            return;
        }

        $tenant = PortalTenant::forUser($user);
        if (! $tenant) {
            $tenant = PortalTenant::query()->create([
                'id' => (string) Str::uuid(),
                'user_id' => (string) $user->id,
                'company_name' => $this->companyName ?: ($user->name ?: 'Portal Client'),
                'subdomain' => $this->resolveSubdomain(),
                'is_temp_subdomain' => false,
                'logo_url' => null,
                'primary_color' => '#22c55e',
                'settings' => [],
                'status' => 'active',
                'onboarding_completed_at' => now(),
            ]);
        }

        $subscription = $this->getOrCreateSubscription($tenant);

        // Build query for available agents
        $agentsQuery = PortalAvailableAgent::query()->where('is_active', true);

        // If specific agent names are provided, filter to only those agents
        if ($this->agentNames !== null && ! empty($this->agentNames)) {
            $agentsQuery->whereIn('name', $this->agentNames);
        }

        $agents = $agentsQuery->orderBy('sort_order')->get();

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
            }
        }
    }

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

    private function resolveSubdomain(): string
    {
        if ($this->subdomain) {
            return $this->subdomain;
        }

        $base = Str::slug(Str::before($this->email, '@'));
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
