<?php

namespace Tests\Feature;

use App\Ai\Agents\Prism;
use App\Models\PortalTenant;
use App\Models\User;
use Tests\TestCase;

class PrismAgentTest extends TestCase
{
    public function test_prism_agent_can_be_instantiated(): void
    {
        $user = User::factory()->create();
        $tenant = PortalTenant::factory()->create();

        $prism = new Prism($user, $tenant);

        $this->assertInstanceOf(Prism::class, $prism);
        $this->assertEquals($user->id, $prism->user->id);
        $this->assertEquals($tenant->id, $prism->tenant->id);
    }

    public function test_prism_has_required_tools(): void
    {
        $user = User::factory()->create();
        $tenant = PortalTenant::factory()->create();

        $prism = new Prism($user, $tenant);
        $tools = $prism->tools();

        $toolNames = [];
        foreach ($tools as $tool) {
            $toolNames[] = get_class($tool);
        }

        $this->assertContains('App\Ai\Tools\PodcastFileIngestionTool', $toolNames);
        $this->assertContains('App\Ai\Tools\ContentDecompositionTool', $toolNames);
        $this->assertContains('App\Ai\Tools\AssetExtractionTool', $toolNames);
        $this->assertContains('App\Ai\Tools\PrismEscalationTool', $toolNames);
        $this->assertContains('App\Ai\Tools\PrismCRMLoggingTool', $toolNames);
    }

    public function test_prism_instructions_contain_operational_boundaries(): void
    {
        $user = User::factory()->create();
        $tenant = PortalTenant::factory()->create();

        $prism = new Prism($user, $tenant);
        $instructions = $prism->instructions();

        $this->assertStringContainsString('draft-ready assets', $instructions);
        $this->assertStringContainsString('human review', $instructions);
        $this->assertStringContainsString('source material', $instructions);
        $this->assertStringContainsString('NO direct publishing', $instructions);
    }

    public function test_prism_conversation_history_is_bounded(): void
    {
        $user = User::factory()->create();
        $tenant = PortalTenant::factory()->create();

        // Create agent with large conversation history
        $largeHistory = [];
        for ($i = 0; $i < 50; $i++) {
            $largeHistory[] = [
                'role' => 'user',
                'content' => 'Test message '.$i.' with some content to make it longer',
            ];
        }

        $prism = new Prism($user, $tenant, $largeHistory);
        $messages = $prism->messages();

        // Should be bounded to reasonable size
        $this->assertLessThanOrEqual(20, count($messages));
    }

    public function test_prism_filters_invalid_conversation_messages(): void
    {
        $user = User::factory()->create();
        $tenant = PortalTenant::factory()->create();

        $invalidHistory = [
            ['role' => 'user', 'content' => 'Valid message'],
            ['role' => 'invalid_role', 'content' => 'Should be filtered'],
            ['content' => 'Missing role'],
            ['role' => 'user'], // Missing content
            ['role' => 'assistant', 'content' => ''], // Empty content
            ['role' => 'assistant', 'content' => 'Valid response'],
        ];

        $prism = new Prism($user, $tenant, $invalidHistory);
        $messages = $prism->messages();

        // Should only have 2 valid messages
        $this->assertEquals(2, count($messages));

        foreach ($messages as $message) {
            $this->assertInstanceOf(\Laravel\Ai\Messages\Message::class, $message);
        }
    }
}
