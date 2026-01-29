<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ApexProspect>
 */
class ApexProspectFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $firstName = fake()->firstName();
        $lastName = fake()->lastName();

        return [
            'user_id' => User::factory(),
            'linkedin_profile_id' => fake()->regexify('[A-Za-z0-9]{10}'),
            'linkedin_profile_url' => 'https://www.linkedin.com/in/'.strtolower($firstName.'-'.$lastName.'-'.fake()->randomNumber(4)),
            'first_name' => $firstName,
            'last_name' => $lastName,
            'full_name' => "$firstName $lastName",
            'headline' => fake()->jobTitle().' at '.fake()->company(),
            'company' => fake()->company(),
            'job_title' => fake()->jobTitle(),
            'location' => fake()->city().', '.fake()->stateAbbr(),
            'email' => fake()->optional()->safeEmail(),
            'phone' => fake()->optional()->phoneNumber(),
            'avatar_url' => fake()->optional()->imageUrl(200, 200, 'people'),
            'connection_status' => 'none',
            'metadata' => [],
            'source' => fake()->randomElement(['apify', 'manual', 'linkedin_search']),
        ];
    }

    /**
     * Indicate that a connection request is pending.
     */
    public function pendingConnection(): static
    {
        return $this->state(fn (array $attributes) => [
            'connection_status' => 'pending',
        ]);
    }

    /**
     * Indicate that the prospect is connected.
     */
    public function connected(): static
    {
        return $this->state(fn (array $attributes) => [
            'connection_status' => 'connected',
        ]);
    }

    /**
     * Indicate the prospect source.
     */
    public function fromSource(string $source): static
    {
        return $this->state(fn (array $attributes) => [
            'source' => $source,
        ]);
    }
}
