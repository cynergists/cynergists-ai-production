<?php

namespace Database\Factories;

use App\Models\ApexCampaign;
use App\Models\ApexProspect;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ApexCampaignProspect>
 */
class ApexCampaignProspectFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'campaign_id' => ApexCampaign::factory(),
            'prospect_id' => ApexProspect::factory(),
            'status' => 'queued',
            'follow_up_count' => 0,
            'metadata' => [],
        ];
    }

    /**
     * Indicate that a connection request has been sent.
     */
    public function connectionSent(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'connection_sent',
            'connection_sent_at' => now()->subDays(fake()->numberBetween(1, 7)),
        ]);
    }

    /**
     * Indicate that the connection was accepted.
     */
    public function connectionAccepted(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'connection_accepted',
            'connection_sent_at' => now()->subDays(fake()->numberBetween(5, 14)),
            'connection_accepted_at' => now()->subDays(fake()->numberBetween(1, 4)),
        ]);
    }

    /**
     * Indicate that a message has been sent.
     */
    public function messageSent(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'message_sent',
            'connection_sent_at' => now()->subDays(14),
            'connection_accepted_at' => now()->subDays(7),
            'last_message_sent_at' => now()->subDays(fake()->numberBetween(1, 3)),
            'follow_up_count' => 1,
            'next_follow_up_at' => now()->addDays(3),
        ]);
    }

    /**
     * Indicate that the prospect replied.
     */
    public function replied(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'replied',
            'connection_sent_at' => now()->subDays(14),
            'connection_accepted_at' => now()->subDays(10),
            'last_message_sent_at' => now()->subDays(5),
            'last_reply_at' => now()->subDays(fake()->numberBetween(1, 3)),
            'follow_up_count' => fake()->numberBetween(1, 3),
        ]);
    }
}
