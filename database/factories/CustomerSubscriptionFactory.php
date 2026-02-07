<?php

namespace Database\Factories;

use App\Models\PortalTenant;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CustomerSubscription>
 */
class CustomerSubscriptionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $tenantId = (string) Str::uuid();

        return [
            'id' => (string) Str::uuid(),
            'customer_id' => $tenantId,
            'product_id' => (string) Str::uuid(),
            'payment_id' => null,
            'status' => 'active',
            'tier' => 'starter',
            'start_date' => now(),
            'end_date' => now()->addYear(),
            'auto_renew' => false,
            'tenant_id' => PortalTenant::factory(),
        ];
    }
}
