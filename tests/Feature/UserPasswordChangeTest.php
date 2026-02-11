<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

it('can change password with correct current password', function () {
    $user = User::factory()->create([
        'password' => Hash::make('oldpassword123'),
        'password_change_required' => true,
    ]);

    $response = $this->actingAs($user)->patchJson('/api/user/password', [
        'current_password' => 'oldpassword123',
        'password' => 'newpassword123',
        'password_confirmation' => 'newpassword123',
    ]);

    $response->assertSuccessful();
    $response->assertJson(['success' => true]);

    $user->refresh();
    expect(Hash::check('newpassword123', $user->password))->toBeTrue();
    expect($user->password_change_required)->toBeFalse();
});

it('fails with incorrect current password', function () {
    $user = User::factory()->create([
        'password' => Hash::make('oldpassword123'),
    ]);

    $response = $this->actingAs($user)->patchJson('/api/user/password', [
        'current_password' => 'wrongpassword',
        'password' => 'newpassword123',
        'password_confirmation' => 'newpassword123',
    ]);

    $response->assertStatus(422);
    $response->assertJson(['message' => 'Current password is incorrect.']);

    $user->refresh();
    expect(Hash::check('oldpassword123', $user->password))->toBeTrue();
});

it('fails when password confirmation does not match', function () {
    $user = User::factory()->create([
        'password' => Hash::make('oldpassword123'),
    ]);

    $response = $this->actingAs($user)->patchJson('/api/user/password', [
        'current_password' => 'oldpassword123',
        'password' => 'newpassword123',
        'password_confirmation' => 'differentpassword',
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['password']);
});

it('fails when password is too short', function () {
    $user = User::factory()->create([
        'password' => Hash::make('oldpassword123'),
    ]);

    $response = $this->actingAs($user)->patchJson('/api/user/password', [
        'current_password' => 'oldpassword123',
        'password' => 'short',
        'password_confirmation' => 'short',
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['password']);
});

it('requires authentication', function () {
    $response = $this->patchJson('/api/user/password', [
        'current_password' => 'oldpassword123',
        'password' => 'newpassword123',
        'password_confirmation' => 'newpassword123',
    ]);

    $response->assertStatus(401);
});

it('enforces rate limiting', function () {
    $user = User::factory()->create([
        'password' => Hash::make('oldpassword123'),
    ]);

    // Make 6 requests (limit is 5 per minute)
    for ($i = 0; $i < 6; $i++) {
        $response = $this->actingAs($user)->patchJson('/api/user/password', [
            'current_password' => 'wrongpassword',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        if ($i < 5) {
            $response->assertStatus(422); // Wrong password error
        } else {
            $response->assertStatus(429); // Too many requests
        }
    }
});
