<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\BriggsUserSettings>
 */
class BriggsUserSettingsFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'skill_level' => 'beginner',
            'preferred_industry' => fake()->optional()->randomElement(['SaaS', 'Real Estate', 'Insurance', 'Healthcare', 'Finance']),
            'briggs_context' => null,
            'briggs_context_updated_at' => null,
            'onboarding_completed' => false,
            'total_sessions_completed' => 0,
            'average_score' => null,
        ];
    }

    /**
     * Indicate that the user has completed onboarding.
     */
    public function onboarded(): static
    {
        return $this->state(fn (array $attributes) => [
            'onboarding_completed' => true,
        ]);
    }

    /**
     * Indicate intermediate skill level.
     */
    public function intermediate(): static
    {
        return $this->state(fn (array $attributes) => [
            'skill_level' => 'intermediate',
        ]);
    }

    /**
     * Indicate advanced skill level.
     */
    public function advanced(): static
    {
        return $this->state(fn (array $attributes) => [
            'skill_level' => 'advanced',
        ]);
    }

    /**
     * Add session stats.
     */
    public function withStats(int $sessions = 10, float $avgScore = 75.00): static
    {
        return $this->state(fn (array $attributes) => [
            'total_sessions_completed' => $sessions,
            'average_score' => $avgScore,
            'onboarding_completed' => true,
        ]);
    }
}
