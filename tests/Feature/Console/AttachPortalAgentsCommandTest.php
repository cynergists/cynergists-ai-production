<?php

use App\Models\PortalAvailableAgent;
use App\Models\User;
use Illuminate\Support\Str;

it('runs the portal:attach-agents command', function () {
    $user = User::factory()->create([
        'email' => 'mike@gmail.com',
    ]);

    PortalAvailableAgent::query()->create([
        'id' => (string) Str::uuid(),
        'name' => 'Beacon',
        'description' => 'General assistant',
        'price' => 0,
        'category' => 'general',
        'icon' => 'bot',
        'features' => [],
        'is_popular' => false,
        'is_active' => true,
        'sort_order' => 1,
        'perfect_for' => [],
        'integrations' => [],
        'image_url' => null,
        'long_description' => null,
    ]);

    $this->artisan('portal:attach-agents', ['email' => $user->email])
        ->assertSuccessful();
});
