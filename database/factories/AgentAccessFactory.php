<?php

namespace Database\Factories;

use App\Models\CustomerSubscription;
use App\Models\PortalTenant;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AgentAccess>
 */
class AgentAccessFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id' => (string) Str::uuid(),
            'subscription_id' => CustomerSubscription::factory(),
            'customer_id' => (string) Str::uuid(),
            'agent_type' => 'assistant',
            'agent_name' => fake()->randomElement(['Apex', 'Carbon', 'Luna', 'Echo']),
            'configuration' => null,
            'is_active' => true,
            'usage_count' => 0,
            'usage_limit' => null,
            'last_used_at' => null,
            'tenant_id' => PortalTenant::factory(),
        ];
    }
}
