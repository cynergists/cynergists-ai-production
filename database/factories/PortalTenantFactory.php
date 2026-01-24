<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PortalTenant>
 */
class PortalTenantFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id' => (string) Str::uuid(),
            'user_id' => User::factory(),
            'company_name' => $this->faker->company(),
            'subdomain' => 'tmp-'.$this->faker->unique()->lexify('????????'),
            'is_temp_subdomain' => true,
            'logo_url' => null,
            'primary_color' => '#22c55e',
            'settings' => [],
            'status' => 'active',
            'onboarding_completed_at' => null,
        ];
    }
}
