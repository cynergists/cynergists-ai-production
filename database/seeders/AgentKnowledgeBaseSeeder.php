<?php

namespace Database\Seeders;

use App\Models\AgentKnowledgeBase;
use Illuminate\Database\Seeder;

class AgentKnowledgeBaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $cynessaContent = file_get_contents(storage_path('app/cynessa-knowledge-base.md'));

        AgentKnowledgeBase::updateOrCreate(
            ['agent_name' => 'cynessa'],
            [
                'title' => 'Cynessa Knowledge Base v1.1',
                'content' => $cynessaContent,
                'is_active' => true,
                'version' => 'v1.1',
                'last_updated_by_user_at' => now(),
            ]
        );

        $this->command->info('Cynessa knowledge base seeded successfully!');
    }
}
