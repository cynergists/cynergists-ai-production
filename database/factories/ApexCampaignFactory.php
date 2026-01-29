<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ApexCampaign>
 */
class ApexCampaignFactory extends Factory
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
            'name' => fake()->sentence(3),
            'campaign_type' => fake()->randomElement(['connection', 'message', 'follow_up']),
            'status' => 'draft',
            'job_titles' => fake()->randomElements(['CEO', 'CTO', 'VP Sales', 'Marketing Director', 'Founder'], 2),
            'locations' => fake()->randomElements(['Denver, CO', 'New York, NY', 'San Francisco, CA', 'Austin, TX'], 2),
            'keywords' => fake()->optional()->words(3),
            'industries' => fake()->optional()->randomElements(['Technology', 'Finance', 'Healthcare', 'Marketing'], 2),
            'connection_message' => fake()->paragraph(),
            'follow_up_message_1' => fake()->paragraph(),
            'follow_up_message_2' => fake()->optional()->paragraph(),
            'follow_up_message_3' => fake()->optional()->paragraph(),
            'follow_up_delay_days_1' => 3,
            'follow_up_delay_days_2' => 7,
            'follow_up_delay_days_3' => 14,
            'booking_method' => fake()->randomElement(['calendar', 'phone', 'manual']),
            'calendar_link' => fake()->optional()->url(),
            'phone_number' => fake()->optional()->phoneNumber(),
            'daily_connection_limit' => 25,
            'daily_message_limit' => 50,
            'connections_sent' => 0,
            'connections_accepted' => 0,
            'messages_sent' => 0,
            'replies_received' => 0,
            'meetings_booked' => 0,
        ];
    }

    /**
     * Indicate that the campaign is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'active',
            'started_at' => now(),
        ]);
    }

    /**
     * Indicate that the campaign is paused.
     */
    public function paused(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'paused',
            'started_at' => now()->subDays(5),
            'paused_at' => now(),
        ]);
    }

    /**
     * Indicate that the campaign is completed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'started_at' => now()->subMonth(),
            'completed_at' => now(),
        ]);
    }

    /**
     * Add stats to the campaign.
     */
    public function withStats(int $connections = 50, int $accepted = 25, int $messages = 40, int $replies = 10): static
    {
        return $this->state(fn (array $attributes) => [
            'connections_sent' => $connections,
            'connections_accepted' => $accepted,
            'messages_sent' => $messages,
            'replies_received' => $replies,
            'meetings_booked' => fake()->numberBetween(0, min($replies, 5)),
        ]);
    }
}
