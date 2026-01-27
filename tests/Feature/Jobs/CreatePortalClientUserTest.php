<?php

use App\Jobs\CreatePortalClientUser;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Support\Facades\Hash;

it('creates a client user and assigns the client role', function () {
    $job = new CreatePortalClientUser('mike@gmail.com', 'Feb135911@', 'Mike');
    $job->handle();

    $user = User::query()->where('email', 'mike@gmail.com')->first();

    expect($user)->not->toBeNull();
    expect(Hash::check('Feb135911@', $user->password))->toBeTrue();

    $role = UserRole::query()
        ->where('user_id', $user->id)
        ->where('role', 'client')
        ->exists();

    expect($role)->toBeTrue();
});

it('updates an existing user password', function () {
    $user = User::factory()->create([
        'email' => 'mike@gmail.com',
        'password' => Hash::make('old-password'),
    ]);

    (new CreatePortalClientUser('mike@gmail.com', 'Feb135911@'))->handle();

    $user->refresh();

    expect(Hash::check('Feb135911@', $user->password))->toBeTrue();
});
