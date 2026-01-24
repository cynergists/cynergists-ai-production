<?php

use App\Models\PortalTenant;
use App\Models\User;

test('client signup page can be rendered', function () {
    $response = $this->get('/signup/client');

    $response->assertOk();
});

test('new clients can register and get a portal tenant', function () {
    $response = $this->post('/register', [
        'first_name' => 'Test',
        'last_name' => 'User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'company_name' => 'Acme Inc',
        'phone' => '555-555-1234',
        'accept_terms' => true,
        'user_type' => 'client',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect('/portal');

    $user = User::where('email', 'test@example.com')->first();
    expect($user)->not->toBeNull();

    $this->assertDatabaseHas('profiles', [
        'user_id' => $user->id,
        'company_name' => 'Acme Inc',
    ]);

    $this->assertDatabaseHas('user_roles', [
        'user_id' => $user->id,
        'role' => 'client',
    ]);

    expect(PortalTenant::where('user_id', $user->id)->exists())->toBeTrue();
});
