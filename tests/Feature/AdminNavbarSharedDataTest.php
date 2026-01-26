<?php

use App\Models\User;
use App\Models\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

it('shares admin role in inertia props', function () {
    $user = User::factory()->create();
    UserRole::factory()->for($user)->create([
        'role' => 'admin',
    ]);

    $this->actingAs($user)
        ->get('/dashboard')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('auth.roles')
            ->where('auth.roles', ['admin'])
            ->etc()
        );
});
