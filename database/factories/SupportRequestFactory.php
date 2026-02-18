<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SupportRequest>
 */
class SupportRequestFactory extends Factory
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
            'category' => fake()->randomElement(['agent_issue', 'billing', 'feature_request', 'general', 'portal_issue', 'other']),
            'subject' => fake()->sentence(),
            'message' => fake()->paragraph(),
            'status' => 'open',
        ];
    }

    public function withAgent(string $agentName = 'Cynessa'): static
    {
        return $this->state(fn () => [
            'category' => 'agent_issue',
            'agent_name' => $agentName,
        ]);
    }

    public function resolved(): static
    {
        return $this->state(fn () => [
            'status' => 'resolved',
            'resolved_at' => now(),
        ]);
    }
}
