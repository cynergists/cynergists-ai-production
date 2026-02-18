
<?php

use App\Ai\Agents\Arsenal;
use App\Models\PortalTenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->tenant = PortalTenant::factory()->create([
        'user_id' => $this->user->id,
    ]);
});

test('Arsenal agent can be instantiated', function () {
    $agent = new Arsenal(
        user: $this->user,
        tenant: $this->tenant,
        conversationHistory: []
    );

    expect($agent)->toBeInstanceOf(Arsenal::class);
    expect($agent->user)->toBe($this->user);
    expect($agent->tenant)->toBe($this->tenant);
    expect($agent->conversationHistory)->toBe([]);
});

test('Arsenal agent has required tools', function () {
    $agent = new Arsenal(
        user: $this->user,
        tenant: $this->tenant
    );

    $tools = iterator_to_array($agent->tools());
    
    expect($tools)->toHaveCount(3);
    expect($tools[0])->toBeInstanceOf(App\Ai\Tools\ProcessProductDataTool::class);
    expect($tools[1])->toBeInstanceOf(App\Ai\Tools\GenerateContentTool::class);
    expect($tools[2])->toBeInstanceOf(App\Ai\Tools\ValidateImagesTool::class);
});

test('Arsenal agent has proper instructions', function () {
    $agent = new Arsenal(
        user: $this->user,
        tenant: $this->tenant
    );

    $instructions = $agent->instructions();
    
    expect($instructions)->toContain('Arsenal');
    expect($instructions)->toContain('draft-only');
    expect($instructions)->toContain('DRAFT – REQUIRES HUMAN APPROVAL');
    expect($instructions)->toContain('eCommerce Strategist');
});

test('Arsenal agent processes conversation history', function () {
    $conversationHistory = [
        ['role' => 'user', 'content' => 'Hello Arsenal'],
        ['role' => 'assistant', 'content' => 'Hello! I can help with catalog cleanup.'],
    ];

    $agent = new Arsenal(
        user: $this->user,
        tenant: $this->tenant,
        conversationHistory: $conversationHistory
    );

    $messages = iterator_to_array($agent->messages());
    
    expect($messages)->toHaveCount(2);
    expect($messages[0]->role->value)->toBe('user');
    expect($messages[0]->content)->toBe('Hello Arsenal');
    expect($messages[1]->role->value)->toBe('assistant');
    expect($messages[1]->content)->toBe('Hello! I can help with catalog cleanup.');
});

test('Arsenal tools have proper descriptions', function () {
    $agent = new Arsenal(
        user: $this->user,
        tenant: $this->tenant
    );

    $tools = iterator_to_array($agent->tools());
    
    // Test ProcessProductDataTool
    expect($tools[0]->description())->toContain('product data');
    expect($tools[0]->description())->toContain('draft-only');
    
    // Test GenerateContentTool  
    expect($tools[1]->description())->toContain('product content');
    expect($tools[1]->description())->toContain('draft-only');
    
    // Test ValidateImagesTool
    expect($tools[2]->description())->toContain('product images');
    expect($tools[2]->description())->toContain('draft alt-text');
});