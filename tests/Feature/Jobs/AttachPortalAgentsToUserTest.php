<?php

use App\Jobs\AttachPortalAgentsToUser;
use App\Models\AgentAccess;
use App\Models\PortalAvailableAgent;
use App\Models\PortalTenant;
use App\Models\User;
use Illuminate\Support\Str;

it('attaches all active portal agents to the user tenant', function () {
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

    PortalAvailableAgent::query()->create([
        'id' => (string) Str::uuid(),
        'name' => 'Signal',
        'description' => 'Research assistant',
        'price' => 0,
        'category' => 'research',
        'icon' => 'bot',
        'features' => [],
        'is_popular' => false,
        'is_active' => true,
        'sort_order' => 2,
        'perfect_for' => [],
        'integrations' => [],
        'image_url' => null,
        'long_description' => null,
    ]);

    AttachPortalAgentsToUser::dispatchSync($user->email);

    $tenant = PortalTenant::forUser($user);

    expect($tenant)->not->toBeNull();
    expect(
        AgentAccess::query()->where('tenant_id', $tenant->id)->count()
    )->toBe(2);

    $this->assertDatabaseHas('agent_access', [
        'tenant_id' => $tenant->id,
        'agent_name' => 'Beacon',
    ]);

    $this->assertDatabaseHas('agent_access', [
        'tenant_id' => $tenant->id,
        'agent_name' => 'Signal',
    ]);
});
