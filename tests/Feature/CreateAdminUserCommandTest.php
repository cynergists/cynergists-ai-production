<?php

use App\Models\User;
use App\Models\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

it('creates a new admin user', function () {
    $this->artisan('app:create-admin-user', [
        'email' => 'mike@cynergists.com',
        '--name' => 'Mike',
        '--password' => 'secret1234',
    ])->assertExitCode(0);

    $user = User::query()->where('email', 'mike@cynergists.com')->first();

    expect($user)->not->toBeNull();
    expect(Hash::check('secret1234', $user->password))->toBeTrue();

    $this->assertDatabaseHas('user_roles', [
        'user_id' => $user->id,
        'role' => 'admin',
    ]);
});

it('adds admin role to an existing user', function () {
    $user = User::factory()->create([
        'email' => 'existing@cynergists.com',
        'name' => 'Existing User',
    ]);

    $this->artisan('app:create-admin-user', [
        'email' => $user->email,
    ])->assertExitCode(0);

    $this->assertDatabaseHas('user_roles', [
        'user_id' => $user->id,
        'role' => 'admin',
    ]);

    expect(UserRole::query()->where('user_id', $user->id)->where('role', 'admin')->count())
        ->toBe(1);
});
