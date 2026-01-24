<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Profile>
 */
class ProfileFactory extends Factory
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
            'email' => $this->faker->unique()->safeEmail(),
            'first_name' => $this->faker->firstName(),
            'last_name' => $this->faker->lastName(),
            'company_name' => $this->faker->company(),
            'phone' => $this->faker->phoneNumber(),
            'title' => $this->faker->jobTitle(),
            'partnership_interest' => $this->faker->word(),
            'referral_volume' => $this->faker->randomElement(['low', 'medium', 'high']),
            'status' => $this->faker->randomElement(['active', 'pending', 'suspended']),
            'last_login' => $this->faker->optional()->dateTimeBetween('-1 month', 'now'),
        ];
    }
}
