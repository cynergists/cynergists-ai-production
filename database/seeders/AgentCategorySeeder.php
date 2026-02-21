<?php

namespace Database\Seeders;

use App\Models\AgentCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Per Google Doc Spec: Categories System
 *
 * MUST use dropdown (no typing)
 * Buyer-first, not feature-first
 * Categories should answer: "Why would I pay for this agent?"
 */
class AgentCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Customer Support',
                'description' => 'Agents that handle customer inquiries, support tickets, and service requests',
                'sort_order' => 1,
            ],
            [
                'name' => 'Lead Generation',
                'description' => 'Agents that qualify leads, route prospects, and push into CRM',
                'sort_order' => 2,
            ],
            [
                'name' => 'Marketing Automation',
                'description' => 'Agents that automate marketing tasks, content creation, and campaigns',
                'sort_order' => 3,
            ],
            [
                'name' => 'Sales Enablement',
                'description' => 'Agents that support sales teams with outreach, follow-ups, and engagement',
                'sort_order' => 4,
            ],
            [
                'name' => 'Scheduling & Booking',
                'description' => 'Agents that manage calendars, appointments, and scheduling',
                'sort_order' => 5,
            ],
            [
                'name' => 'Voice & Calling',
                'description' => 'Agents that handle phone interactions, voice assistants, and calling',
                'sort_order' => 6,
            ],
            [
                'name' => 'Website & Conversion',
                'description' => 'Website chatbots, form closers, booking assistants, and CRO-focused AI',
                'sort_order' => 7,
            ],
        ];

        foreach ($categories as $category) {
            AgentCategory::updateOrCreate(
                ['slug' => Str::slug($category['name'])],
                [
                    'name' => $category['name'],
                    'description' => $category['description'],
                    'sort_order' => $category['sort_order'],
                    'is_active' => true,
                    'is_archived' => false,
                ]
            );
        }
    }
}
