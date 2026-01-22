<?php

namespace Database\Seeders;

use App\Models\Cynergist;
use Illuminate\Database\Seeder;

class CynergistSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $agents = [
            [
                'name' => 'Apex',
                'title' => 'AI Growth Architect & Lead Generation Strategist',
                'mission' => 'To automate the top-of-funnel sales process on LinkedIn, ensuring the user is positioned as a thought leader while consistently filling the calendar with qualified meetings.',
                'color_key' => 'apex',
                'type' => 'featured',
                'capabilities' => [
                    'Precision targeting with Sales Navigator filters',
                    'Automated connection and follow-up sequences',
                    'Algorithm-aware content strategy',
                ],
                'popular' => true,
            ],
            [
                'name' => 'Aether',
                'title' => 'AI Omnichannel Architect & Data Orchestrator',
                'mission' => 'To ensure the right message reaches the right person at the right time through the right channel, fully automated.',
                'color_key' => 'aether',
                'type' => 'featured',
                'capabilities' => [
                    'Nurture sequences and lifecycle orchestration',
                    'Two-way CRM and campaign sync',
                    'Deliverability and domain health protection',
                ],
                'popular' => true,
            ],
            [
                'name' => 'Backbeat',
                'title' => 'AI Lead Response Manager & SDR',
                'mission' => 'To eliminate lead leakage with instant, human-like responses that answer questions and book meetings without manual follow-up.',
                'color_key' => 'backbeat',
                'type' => 'featured',
                'capabilities' => [
                    'Speed-to-lead automation 24/7',
                    'Contextual objection handling',
                    'Calendar booking and follow-through',
                ],
                'popular' => true,
            ],
            [
                'name' => 'Luna',
                'title' => 'Head of Brand, Design & Content',
                'mission' => 'To ensure the brand’s visual identity and editorial voice are consistent, scalable, and emotionally resonant across all channels.',
                'color_key' => 'luna',
                'type' => 'featured',
                'capabilities' => [
                    'Brand bible and visual standards',
                    'Editorial calendar planning',
                    'Premium creative quality assurance',
                ],
                'popular' => true,
            ],
            [
                'name' => 'Arsenal',
                'title' => 'Head of E-Commerce & CRO',
                'mission' => 'To create a seamless, high-converting digital storefront that maximizes Revenue Per User.',
                'color_key' => 'arsenal',
                'type' => 'specialized',
                'capabilities' => [
                    'Store build and merchandising strategy',
                    'Checkout optimization and conversion lifts',
                    'Dynamic pricing and offer testing',
                ],
            ],
            [
                'name' => 'Carbon',
                'title' => 'Head of Automation & Technical SEO',
                'mission' => 'To ensure the technology stack is invisible, frictionless, and infinitely scalable.',
                'color_key' => 'carbon',
                'type' => 'specialized',
                'capabilities' => [
                    'Custom automation workflows and syncing',
                    'Technical SEO and indexing integrity',
                    'System health monitoring and recovery',
                ],
            ],
            [
                'name' => 'Cynessa',
                'title' => 'AI Client Experience Director & Onboarding Lead',
                'mission' => 'To ensure every interaction with the brand feels white-glove and magical, reducing churn through radical empathy.',
                'color_key' => 'cynessa',
                'type' => 'specialized',
                'capabilities' => [
                    'Personalized welcome experiences',
                    'Churn prediction and re-engagement',
                    '24/7 concierge-level support',
                ],
            ],
            [
                'name' => 'Libra',
                'title' => 'Head of Legal Operations & Compliance',
                'mission' => 'To ensure the company scales rapidly without exposing itself to catastrophic risk or liability.',
                'color_key' => 'libra',
                'type' => 'specialized',
                'capabilities' => [
                    'Contract redlines and risk reviews',
                    'Compliance audits and opt-in checks',
                    'IP and copyright protection scans',
                ],
            ],
        ];

        foreach ($agents as $agent) {
            Cynergist::updateOrCreate(
                ['name' => $agent['name']],
                $agent,
            );
        }
    }
}
