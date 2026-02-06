<?php

namespace Database\Factories;

use App\Models\SeoSite;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SeoReport>
 */
class SeoReportFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $periodStart = $this->faker->dateTimeBetween('-2 months', '-1 month')->format('Y-m-01');
        $periodEnd = date('Y-m-t', strtotime($periodStart));

        return [
            'id' => (string) Str::uuid(),
            'seo_site_id' => SeoSite::factory(),
            'period_start' => $periodStart,
            'period_end' => $periodEnd,
            'status' => 'ready',
            'highlights' => [
                'health_score' => $this->faker->numberBetween(70, 98),
                'keywords_moved' => $this->faker->numberBetween(5, 45),
            ],
            'report_url' => null,
            'metrics' => [],
        ];
    }
}
