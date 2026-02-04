<?php

namespace Database\Factories;

use App\Models\PortalTenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SeoSite>
 */
class SeoSiteFactory extends Factory
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
            'tenant_id' => PortalTenant::factory(),
            'user_id' => User::factory(),
            'tracking_id' => (string) Str::uuid(),
            'name' => $this->faker->company().' Site',
            'url' => 'https://'.$this->faker->domainName(),
            'status' => 'active',
            'settings' => [],
            'last_audit_at' => null,
            'pixel_install_method' => null,
            'pixel_install_status' => 'not_installed',
            'pixel_last_seen_at' => null,
        ];
    }
}
