<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

beforeEach(function () {
    $this->user = User::factory()->create([
        'email' => 'newuser@example.com',
        'password' => null,
    ]);
});

it('renders welcome page with token and email parameters', function () {
    $response = $this->get('/welcome?token=test-token&email=newuser@example.com');

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('auth/reset-password')
        ->has('email')
        ->has('token')
        ->has('isNewUser')
    );
});

it('always sets isNewUser to true on the welcome page', function () {
    $response = $this->get('/welcome?token=test-token&email=newuser@example.com');

    $response->assertInertia(fn ($page) => $page
        ->where('email', 'newuser@example.com')
        ->where('token', 'test-token')
        ->where('isNewUser', true)
    );
});

it('shows welcoming language even for existing users with password', function () {
    User::factory()->create([
        'email' => 'existing@example.com',
        'password' => Hash::make('password123'),
    ]);

    $response = $this->get('/welcome?token=test-token&email=existing@example.com');

    $response->assertInertia(fn ($page) => $page
        ->where('isNewUser', true)
    );
});

it('handles non-existent email gracefully', function () {
    $response = $this->get('/welcome?token=test-token&email=nonexistent@example.com');

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->where('email', 'nonexistent@example.com')
        ->where('token', 'test-token')
        ->where('isNewUser', true)
    );
});

it('passes token and email to reset password component', function () {
    $response = $this->get('/welcome?token=abc123xyz&email=newuser@example.com');

    $response->assertInertia(fn ($page) => $page
        ->component('auth/reset-password')
        ->where('email', 'newuser@example.com')
        ->where('token', 'abc123xyz')
    );
});
