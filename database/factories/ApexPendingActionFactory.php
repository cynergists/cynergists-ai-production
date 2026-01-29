<?php

namespace Database\Factories;

use App\Models\ApexCampaign;
use App\Models\ApexProspect;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ApexPendingAction>
 */
class ApexPendingActionFactory extends Factory
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
            'campaign_id' => ApexCampaign::factory(),
            'prospect_id' => ApexProspect::factory(),
            'action_type' => fake()->randomElement([
                'send_connection',
                'send_message',
                'send_follow_up',
            ]),
            'status' => 'pending',
            'message_content' => fake()->paragraph(),
            'metadata' => [],
            'expires_at' => now()->addDays(7),
        ];
    }

    /**
     * Indicate that the action is approved.
     */
    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'approved',
            'approved_at' => now(),
        ]);
    }

    /**
     * Indicate that the action is denied.
     */
    public function denied(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'denied',
        ]);
    }

    /**
     * Indicate that the action has been executed.
     */
    public function executed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'executed',
            'approved_at' => now()->subHour(),
            'executed_at' => now(),
        ]);
    }

    /**
     * Indicate that the action has expired.
     */
    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'expired',
            'expires_at' => now()->subDay(),
        ]);
    }

    /**
     * Create a connection request action.
     */
    public function connectionRequest(): static
    {
        return $this->state(fn (array $attributes) => [
            'action_type' => 'send_connection',
        ]);
    }

    /**
     * Create a message action.
     */
    public function message(): static
    {
        return $this->state(fn (array $attributes) => [
            'action_type' => 'send_message',
        ]);
    }
}
