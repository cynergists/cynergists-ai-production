<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ApexLinkedInAccount>
 */
class ApexLinkedInAccountFactory extends Factory
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
            'unipile_account_id' => fake()->uuid(),
            'linkedin_profile_id' => fake()->regexify('[A-Za-z0-9]{10}'),
            'linkedin_profile_url' => 'https://www.linkedin.com/in/'.fake()->slug(2),
            'display_name' => fake()->name(),
            'email' => fake()->email(),
            'avatar_url' => fake()->optional()->imageUrl(200, 200, 'people'),
            'status' => 'active',
            'checkpoint_type' => null,
            'metadata' => [],
            'last_synced_at' => fake()->dateTimeThisMonth(),
        ];
    }

    /**
     * Indicate that the account is pending.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
        ]);
    }

    /**
     * Indicate that the account requires a checkpoint.
     */
    public function withCheckpoint(string $type = 'captcha'): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'checkpoint_type' => $type,
        ]);
    }

    /**
     * Indicate that the account is disconnected.
     */
    public function disconnected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'disconnected',
        ]);
    }
}
