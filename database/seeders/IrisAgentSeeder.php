<?php

namespace Database\Seeders;

use App\Models\PortalAvailableAgent;
use Illuminate\Database\Seeder;

class IrisAgentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        PortalAvailableAgent::updateOrCreate(
            ['name' => 'Iris'],
            [
                'description' => 'Voice-first AI Onboarding assistant for Cynergists. Iris guides new customers through a structured intake conversation to capture business identity, brand kit, and operational information.',
                'job_title' => 'AI Onboarding Assistant',
                'slug' => 'iris',
                'category' => 'Onboarding',
                'is_active' => true,
                'is_popular' => false,
                'is_beta' => false,
                'features' => [],
                'perfect_for' => [],
                'integrations' => [],
                'sort_order' => 0,
                'section_order' => 0,
            ]
        );
    }
}
