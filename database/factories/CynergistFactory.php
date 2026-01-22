<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Cynergist>
 */
class CynergistFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->unique()->firstName(),
            'title' => $this->faker->jobTitle(),
            'mission' => $this->faker->sentence(18),
            'color_key' => $this->faker->randomElement(['apex', 'aether', 'backbeat', 'luna', 'arsenal', 'carbon', 'cynessa', 'libra']),
            'type' => $this->faker->randomElement(['featured', 'specialized']),
            'capabilities' => $this->faker->sentences(3),
            'popular' => $this->faker->boolean(25),
        ];
    }
}
