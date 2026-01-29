<?php

namespace Database\Factories;

use App\Models\ApexCampaign;
use App\Models\ApexProspect;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ApexActivityLog>
 */
class ApexActivityLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $activityTypes = [
            'connection_sent',
            'connection_accepted',
            'connection_rejected',
            'message_sent',
            'reply_received',
            'follow_up_sent',
            'meeting_scheduled',
            'campaign_started',
            'campaign_paused',
            'campaign_completed',
            'linkedin_connected',
            'linkedin_disconnected',
        ];

        return [
            'user_id' => User::factory(),
            'campaign_id' => fake()->optional()->passthrough(ApexCampaign::factory()),
            'prospect_id' => fake()->optional()->passthrough(ApexProspect::factory()),
            'activity_type' => fake()->randomElement($activityTypes),
            'description' => fake()->optional()->sentence(),
            'metadata' => [],
        ];
    }

    /**
     * Create a connection sent activity.
     */
    public function connectionSent(): static
    {
        return $this->state(fn (array $attributes) => [
            'activity_type' => 'connection_sent',
            'description' => 'Connection request sent',
        ]);
    }

    /**
     * Create a message sent activity.
     */
    public function messageSent(): static
    {
        return $this->state(fn (array $attributes) => [
            'activity_type' => 'message_sent',
            'description' => 'Message sent to prospect',
        ]);
    }

    /**
     * Create a campaign started activity.
     */
    public function campaignStarted(): static
    {
        return $this->state(fn (array $attributes) => [
            'activity_type' => 'campaign_started',
            'description' => 'Campaign started',
            'prospect_id' => null,
        ]);
    }
}
