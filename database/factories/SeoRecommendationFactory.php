<?php

namespace Database\Factories;

use App\Models\SeoAudit;
use App\Models\SeoSite;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SeoRecommendation>
 */
class SeoRecommendationFactory extends Factory
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
            'seo_site_id' => SeoSite::factory(),
            'seo_audit_id' => SeoAudit::factory(),
            'type' => $this->faker->randomElement(['technical', 'on_page', 'local', 'schema', 'aeo']),
            'title' => $this->faker->sentence(6),
            'description' => $this->faker->paragraph(),
            'target_pages' => [
                'https://'.$this->faker->domainName().'/'.$this->faker->slug(),
            ],
            'impact_score' => $this->faker->numberBetween(20, 95),
            'effort' => $this->faker->randomElement(['low', 'medium', 'high']),
            'status' => 'pending',
            'metadata' => [],
            'approved_at' => null,
            'applied_at' => null,
        ];
    }
}
