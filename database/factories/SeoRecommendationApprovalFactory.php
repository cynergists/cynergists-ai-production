<?php

namespace Database\Factories;

use App\Models\SeoRecommendation;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SeoRecommendationApproval>
 */
class SeoRecommendationApprovalFactory extends Factory
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
            'seo_recommendation_id' => SeoRecommendation::factory(),
            'user_id' => User::factory(),
            'decision' => $this->faker->randomElement(['approved', 'rejected']),
            'notes' => $this->faker->optional()->sentence(),
            'decided_at' => $this->faker->dateTimeBetween('-3 days', 'now'),
        ];
    }
}
