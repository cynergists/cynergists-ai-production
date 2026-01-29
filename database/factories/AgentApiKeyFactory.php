<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AgentApiKey>
 */
class AgentApiKeyFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $providers = ['openai', 'unipile', 'apify', 'elevenlabs', 'resend'];
        $provider = fake()->randomElement($providers);

        return [
            'name' => ucfirst($provider).' '.fake()->randomElement(['Production', 'Development', 'Testing']),
            'provider' => $provider,
            'key' => 'sk-'.fake()->sha256(),
            'metadata' => $this->getMetadataForProvider($provider),
            'is_active' => true,
            'expires_at' => fake()->optional(0.2)->dateTimeBetween('+1 month', '+1 year'),
        ];
    }

    /**
     * Get metadata for a specific provider.
     *
     * @return array<string, mixed>
     */
    private function getMetadataForProvider(string $provider): array
    {
        return match ($provider) {
            'unipile' => [
                'domain' => 'api'.fake()->numberBetween(1, 5).'.unipile.com',
                'account_id' => fake()->uuid(),
            ],
            'openai' => [
                'model' => fake()->randomElement(['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo']),
            ],
            'elevenlabs' => [
                'voice_id' => fake()->uuid(),
            ],
            default => [],
        };
    }

    /**
     * Indicate that the API key is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Indicate that the API key has expired.
     */
    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'expires_at' => fake()->dateTimeBetween('-1 year', '-1 day'),
        ]);
    }

    /**
     * Create an API key for a specific provider.
     */
    public function forProvider(string $provider): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => ucfirst($provider).' '.fake()->randomElement(['Production', 'Development', 'Testing']),
            'provider' => $provider,
            'metadata' => $this->getMetadataForProvider($provider),
        ]);
    }
}
