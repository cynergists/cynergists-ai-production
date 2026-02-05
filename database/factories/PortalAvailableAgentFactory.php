<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PortalAvailableAgent>
 */
class PortalAvailableAgentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->words(2, true);

        return [
            'id' => (string) Str::uuid(),
            'name' => ucwords($name),
            'slug' => Str::slug($name),
            'job_title' => fake()->jobTitle(),
            'description' => fake()->paragraph(),
            'price' => fake()->randomFloat(2, 0, 500),
            'category' => fake()->randomElement(['marketing', 'sales', 'support', 'general']),
            'icon' => 'bot',
            'features' => fake()->words(5),
            'is_popular' => fake()->boolean(20),
            'is_active' => true,
            'sort_order' => fake()->numberBetween(1, 100),
            'section_order' => fake()->numberBetween(1, 10),
            'perfect_for' => fake()->words(3),
            'integrations' => [],
        ];
    }

    /**
     * Indicate that the agent is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Indicate that the agent is popular.
     */
    public function popular(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_popular' => true,
        ]);
    }

    /**
     * Indicate that the agent has a redirect URL.
     */
    public function withRedirect(?string $url = null): static
    {
        return $this->state(fn (array $attributes) => [
            'redirect_url' => $url ?? fake()->url(),
        ]);
    }
}
