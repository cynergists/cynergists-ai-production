<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\BriggsTrainingScenario>
 */
class BriggsTrainingScenarioFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = fake()->sentence(4);

        return [
            'title' => $title,
            'slug' => Str::slug($title),
            'description' => fake()->paragraph(),
            'category' => fake()->randomElement([
                'objection_handling', 'cold_call', 'discovery_call',
                'pitch', 'closing', 'follow_up', 'negotiation',
            ]),
            'difficulty' => fake()->randomElement(['beginner', 'intermediate', 'advanced']),
            'industry' => fake()->optional()->randomElement(['SaaS', 'Real Estate', 'Insurance', 'Healthcare']),
            'buyer_persona' => fake()->paragraph(),
            'buyer_name' => fake()->name(),
            'buyer_title' => fake()->jobTitle(),
            'buyer_company' => fake()->company(),
            'scenario_context' => fake()->paragraph(3),
            'objectives' => [
                'Build rapport with the buyer',
                'Identify key pain points',
                'Present a clear value proposition',
            ],
            'scoring_criteria' => [
                ['criterion' => 'Active Listening', 'weight' => 20, 'description' => 'Demonstrates understanding of buyer needs'],
                ['criterion' => 'Value Articulation', 'weight' => 25, 'description' => 'Clearly communicates product value'],
                ['criterion' => 'Objection Handling', 'weight' => 25, 'description' => 'Addresses concerns effectively'],
                ['criterion' => 'Rapport Building', 'weight' => 15, 'description' => 'Creates a positive connection'],
                ['criterion' => 'Call to Action', 'weight' => 15, 'description' => 'Moves conversation toward next steps'],
            ],
            'common_objections' => [
                'The price is too high for our budget.',
                'We are already using a competitor.',
                'I need to talk to my team first.',
            ],
            'ideal_responses' => null,
            'is_active' => true,
            'sort_order' => 0,
        ];
    }

    /**
     * Objection handling scenario.
     */
    public function objectionHandling(): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => 'objection_handling',
        ]);
    }

    /**
     * Cold call scenario.
     */
    public function coldCall(): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => 'cold_call',
        ]);
    }

    /**
     * Discovery call scenario.
     */
    public function discoveryCall(): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => 'discovery_call',
        ]);
    }

    /**
     * Advanced difficulty.
     */
    public function advanced(): static
    {
        return $this->state(fn (array $attributes) => [
            'difficulty' => 'advanced',
        ]);
    }

    /**
     * Beginner difficulty.
     */
    public function beginner(): static
    {
        return $this->state(fn (array $attributes) => [
            'difficulty' => 'beginner',
        ]);
    }
}
