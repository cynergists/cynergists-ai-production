<?php

use App\Models\PortalAvailableAgent;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('returns active marketplace agents', function () {
    PortalAvailableAgent::query()->create([
        'id' => (string) \Illuminate\Support\Str::uuid(),
        'name' => 'Marketplace Agent',
        'description' => 'Test agent',
        'price' => 100,
        'category' => 'General',
        'is_active' => true,
        'is_popular' => false,
        'features' => ['Feature one', 'Feature two'],
    ]);

    $this->getJson('/api/public/agents')
        ->assertOk()
        ->assertJsonFragment([
            'name' => 'Marketplace Agent',
            'features' => ['Feature one', 'Feature two'],
            'category' => 'General',
            'slug' => 'marketplace-agent',
        ]);
});
