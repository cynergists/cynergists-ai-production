<?php

use App\Models\Profile;
use App\Models\User;

it('returns the authenticated user profile', function () {
    $user = User::factory()->create();
    Profile::factory()->for($user)->create([
        'email' => $user->email,
        'first_name' => 'Mike',
        'last_name' => 'Curtis',
        'company_name' => 'Cynergists',
    ]);

    $response = $this->actingAs($user)->getJson('/api/portal/profile');

    $response->assertSuccessful();
    $response->assertJsonPath('profile.first_name', 'Mike');
    $response->assertJsonPath('profile.last_name', 'Curtis');
    $response->assertJsonPath('profile.company_name', 'Cynergists');
});

it('creates and updates the portal profile', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->putJson('/api/portal/profile', [
        'first_name' => 'Mike',
        'last_name' => 'Curtis',
        'company_name' => 'Cynergists',
    ]);

    $response->assertSuccessful();
    $response->assertJsonPath('success', true);

    $this->assertDatabaseHas('profiles', [
        'user_id' => $user->id,
        'email' => $user->email,
        'first_name' => 'Mike',
        'last_name' => 'Curtis',
        'company_name' => 'Cynergists',
    ]);
});
