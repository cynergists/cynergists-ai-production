<?php

namespace Database\Factories;

use App\Models\SeoSite;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SeoAudit>
 */
class SeoAuditFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startedAt = $this->faker->dateTimeBetween('-2 days', '-1 day');
        $completedAt = (clone $startedAt)->modify('+30 minutes');

        return [
            'id' => (string) Str::uuid(),
            'seo_site_id' => SeoSite::factory(),
            'status' => 'completed',
            'trigger' => 'scheduled',
            'issues_count' => $this->faker->numberBetween(0, 120),
            'metrics' => [
                'health_score' => $this->faker->numberBetween(65, 98),
                'performance_score' => $this->faker->numberBetween(50, 95),
            ],
            'summary' => $this->faker->sentence(12),
            'started_at' => $startedAt,
            'completed_at' => $completedAt,
        ];
    }
}
