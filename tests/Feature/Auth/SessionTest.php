<?php

use App\Models\User;
use App\Models\UserRole;
use Illuminate\Support\Facades\Hash;

it('logs in and redirects based on roles', function () {
    $user = User::factory()->create([
        'password' => Hash::make('password'),
    ]);

    UserRole::factory()->create([
        'user_id' => $user->id,
        'role' => 'admin',
    ]);

    $response = $this->post('/signin', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertRedirect('/admin/dashboard');
    $this->assertAuthenticatedAs($user);
    $this->assertDatabaseHas('profiles', [
        'user_id' => $user->id,
        'email' => $user->email,
    ]);
});

it('logs out and redirects home', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/logout');

    $response->assertRedirect('/');
    $this->assertGuest();
});
