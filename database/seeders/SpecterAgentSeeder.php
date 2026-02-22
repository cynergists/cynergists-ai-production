<?php

namespace Database\Seeders;

use App\Models\PortalAvailableAgent;
use Illuminate\Database\Seeder;

class SpecterAgentSeeder extends Seeder
{
    public function run(): void
    {
        PortalAvailableAgent::updateOrCreate(
            ['name' => 'Specter'],
            [
                'description' => 'Website Intelligence & Identity Resolution agent that tracks compliant visitor signals, scores intent, and syncs structured CRM events.',
                'job_title' => 'Website Intelligence & Identity Resolution Agent',
                'slug' => 'specter',
                'category' => 'Revenue Intelligence',
                'is_active' => true,
                'is_popular' => false,
                'is_beta' => true,
                'features' => [
                    'Real-time visitor monitoring',
                    'Intent scoring and heat zones',
                    'Consent-gated identity resolution',
                    'GHL CRM event sync',
                    'Workflow trigger payloads',
                ],
                'perfect_for' => [
                    'B2B websites with pricing/demo funnels',
                    'Teams needing visitor intelligence before outreach',
                ],
                'integrations' => ['GoHighLevel', 'Approved Reverse IP Provider', 'Cynergists Workflows'],
                'sort_order' => 4,
                'section_order' => 1,
            ]
        );
    }
}
