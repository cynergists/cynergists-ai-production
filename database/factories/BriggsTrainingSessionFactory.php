<?php

namespace Database\Factories;

use App\Models\BriggsTrainingScenario;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\BriggsTrainingSession>
 */
class BriggsTrainingSessionFactory extends Factory
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
            'scenario_id' => BriggsTrainingScenario::factory(),
            'title' => fake()->sentence(3),
            'category' => fake()->randomElement([
                'objection_handling', 'cold_call', 'discovery_call',
                'pitch', 'closing', 'follow_up', 'negotiation',
            ]),
            'difficulty' => fake()->randomElement(['beginner', 'intermediate', 'advanced']),
            'status' => 'in_progress',
            'conversation_log' => null,
            'score' => null,
            'score_breakdown' => null,
            'strengths' => null,
            'improvements' => null,
            'ai_feedback' => null,
            'duration_seconds' => null,
            'started_at' => now(),
            'completed_at' => null,
        ];
    }

    /**
     * Indicate the session is completed with scoring.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'score' => fake()->randomFloat(2, 40, 100),
            'score_breakdown' => [
                ['criterion' => 'Active Listening', 'score' => fake()->numberBetween(5, 20), 'max_score' => 20, 'feedback' => 'Good engagement with buyer concerns.'],
                ['criterion' => 'Value Articulation', 'score' => fake()->numberBetween(10, 25), 'max_score' => 25, 'feedback' => 'Clear communication of value.'],
                ['criterion' => 'Objection Handling', 'score' => fake()->numberBetween(10, 25), 'max_score' => 25, 'feedback' => 'Handled objections with confidence.'],
                ['criterion' => 'Rapport Building', 'score' => fake()->numberBetween(5, 15), 'max_score' => 15, 'feedback' => 'Built connection naturally.'],
                ['criterion' => 'Call to Action', 'score' => fake()->numberBetween(5, 15), 'max_score' => 15, 'feedback' => 'Clear next steps proposed.'],
            ],
            'strengths' => ['Strong opening rapport', 'Good use of open-ended questions'],
            'improvements' => ['Could probe deeper on budget concerns', 'Strengthen the closing statement'],
            'ai_feedback' => fake()->paragraph(3),
            'duration_seconds' => fake()->numberBetween(180, 900),
            'started_at' => now()->subMinutes(15),
            'completed_at' => now(),
        ]);
    }

    /**
     * Indicate the session was abandoned.
     */
    public function abandoned(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'abandoned',
            'started_at' => now()->subHours(2),
        ]);
    }

    /**
     * High score session.
     */
    public function highScore(): static
    {
        return $this->completed()->state(fn (array $attributes) => [
            'score' => fake()->randomFloat(2, 85, 100),
        ]);
    }

    /**
     * Low score session.
     */
    public function lowScore(): static
    {
        return $this->completed()->state(fn (array $attributes) => [
            'score' => fake()->randomFloat(2, 20, 45),
        ]);
    }
}
