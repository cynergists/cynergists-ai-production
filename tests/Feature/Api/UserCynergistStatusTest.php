<?php

use App\Models\Cynergist;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('returns active and attached when user has cynergist', function () {
    $user = User::factory()->create([
        'email' => 'owner@cynergists.ai',
        'is_active' => true,
    ]);
    $cynergist = Cynergist::factory()->create(['name' => 'Apex']);

    $user->cynergists()->attach($cynergist);

    $response = $this->getJson('/api/user-cynergist-status?email=owner@cynergists.ai&cynergist=Apex');

    $response->assertOk()->assertJson([
        'active_account' => true,
        'cynergist_attached' => true,
    ]);
});

it('returns inactive when user does not exist', function () {
    Cynergist::factory()->create(['name' => 'Aether']);

    $response = $this->getJson('/api/user-cynergist-status?email=missing@cynergists.ai&cynergist=Aether');

    $response->assertOk()->assertJson([
        'active_account' => false,
        'cynergist_attached' => false,
    ]);
});

it('returns inactive when user is not active', function () {
    $user = User::factory()->create([
        'email' => 'inactive@cynergists.ai',
        'is_active' => false,
    ]);
    $cynergist = Cynergist::factory()->create(['name' => 'Luna']);

    $user->cynergists()->attach($cynergist);

    $response = $this->getJson('/api/user-cynergist-status?email=inactive@cynergists.ai&cynergist=Luna');

    $response->assertOk()->assertJson([
        'active_account' => false,
        'cynergist_attached' => false,
    ]);
});
