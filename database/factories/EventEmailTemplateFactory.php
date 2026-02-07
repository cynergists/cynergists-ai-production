<?php

namespace Database\Factories;

use App\Models\SystemEvent;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\EventEmailTemplate>
 */
class EventEmailTemplateFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'system_event_id' => SystemEvent::factory(),
            'recipient_type' => fake()->randomElement(['client', 'admin']),
            'name' => fake()->sentence(3),
            'subject' => 'Hello {{ user_name }}',
            'body' => '<p>Hello <span data-type="mergeTag" data-id="user_name">{{ user_name }}</span>, this is a test email.</p>',
            'is_active' => true,
        ];
    }

    public function client(): static
    {
        return $this->state(fn (array $attributes) => [
            'recipient_type' => 'client',
        ]);
    }

    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'recipient_type' => 'admin',
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
