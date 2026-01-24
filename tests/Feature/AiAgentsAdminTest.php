<?php

use App\Models\PortalAvailableAgent;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

it('creates an AI agent via admin endpoint', function () {
    $user = User::factory()->create();
    UserRole::factory()->create([
        'user_id' => $user->id,
        'role' => 'admin',
    ]);

    $payload = [
        'name' => 'Growth Booster',
        'job_title' => 'Growth Strategist',
        'description' => 'Helps optimize growth funnels.',
        'price' => 199,
        'category' => 'Growth',
        'website_category' => ['New'],
        'features' => ['Feature A', 'Feature B'],
        'card_media' => [
            ['url' => 'https://example.com/card.jpg', 'type' => 'image'],
        ],
        'product_media' => [
            ['url' => 'https://example.com/product.jpg', 'type' => 'image'],
        ],
        'is_popular' => true,
        'is_active' => true,
        'sort_order' => 1,
    ];

    $this->actingAs($user)
        ->postJson('/api/admin-data?action=create_ai_agent', $payload)
        ->assertOk();

    $agent = PortalAvailableAgent::query()->where('name', 'Growth Booster')->first();

    expect($agent)->not->toBeNull()
        ->and($agent?->card_media)->toBeArray()
        ->and($agent?->product_media)->toBeArray();
});

it('renders the AI agent editor for new agents', function () {
    config(['inertia.testing.ensure_pages_exist' => false]);

    $response = $this->get('/admin/ai-agents/new');

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/AIAgentEdit')
            ->where('id', 'new')
        );
});
