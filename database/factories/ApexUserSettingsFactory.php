<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ApexUserSettings>
 */
class ApexUserSettingsFactory extends Factory
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
            'unipile_account_id' => fake()->optional()->uuid(),
            'autopilot_enabled' => fake()->boolean(20),
            'auto_reply_enabled' => fake()->boolean(20),
            'meeting_link' => fake()->optional()->url(),
            'apex_context' => fake()->optional()->paragraph(),
            'apex_context_updated_at' => fake()->optional()->dateTimeThisMonth(),
            'onboarding_completed' => fake()->boolean(80),
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
     * Indicate that autopilot is enabled.
     */
    public function withAutopilot(): static
    {
        return $this->state(fn (array $attributes) => [
            'autopilot_enabled' => true,
        ]);
    }
}
