<?php

namespace Database\Factories;

use App\Models\SeoRecommendation;
use App\Models\SeoSite;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SeoChange>
 */
class SeoChangeFactory extends Factory
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
            'seo_recommendation_id' => SeoRecommendation::factory(),
            'status' => $this->faker->randomElement(['applied', 'failed']),
            'summary' => $this->faker->sentence(10),
            'diff' => [],
            'metadata' => [],
            'applied_at' => $this->faker->dateTimeBetween('-2 days', 'now'),
        ];
    }
}
