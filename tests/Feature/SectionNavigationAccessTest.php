<?php

use App\Models\User;
use App\Models\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('redirects non sales users away from sales resources', function () {
    $user = User::factory()->create();
    UserRole::factory()->create([
        'user_id' => $user->id,
        'role' => 'client',
    ]);

    $this->actingAs($user)
        ->get('/sales')
        ->assertRedirect('/portal');
});

it('allows sales reps to access sales resources', function () {
    $user = User::factory()->create();
    UserRole::factory()->create([
        'user_id' => $user->id,
        'role' => 'sales_rep',
    ]);

    $this->actingAs($user)
        ->get('/sales')
        ->assertOk();
});

it('redirects non admin users away from admin routes', function () {
    $user = User::factory()->create();
    UserRole::factory()->create([
        'user_id' => $user->id,
        'role' => 'client',
    ]);

    $this->actingAs($user)
        ->get('/admin/prospects')
        ->assertRedirect('/portal');
});

it('allows admins to access admin routes', function () {
    $user = User::factory()->create();
    UserRole::factory()->create([
        'user_id' => $user->id,
        'role' => 'admin',
    ]);

    $this->actingAs($user)
        ->get('/admin/prospects')
        ->assertOk();
});

it('redirects legacy sales route to the canonical sales root', function () {
    $response = $this->get('/sales-rep');

    $response->assertRedirect('/sales');
});
