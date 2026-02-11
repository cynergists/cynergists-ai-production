<?php

use App\Models\User;
use App\Models\UserRole;
use Illuminate\Support\Facades\Hash;

it('complete temporary password flow works end-to-end', function () {
    // Step 1: Create a user with temporary password
    $tempPassword = 'TempPass123';
    $user = User::factory()->create([
        'password' => $tempPassword, // Will be auto-hashed by 'hashed' cast
        'password_change_required' => true,
    ]);

    // Verify password was hashed correctly
    expect(Hash::check($tempPassword, $user->password))->toBeTrue();
    expect($user->password_change_required)->toBeTrue();

    // Step 2: User signs in with temporary password (simulated)
    $this->actingAs($user);

    // Step 3: User changes password
    $newPassword = 'NewSecurePass123';
    $response = $this->patchJson('/api/user/password', [
        'current_password' => $tempPassword,
        'password' => $newPassword,
        'password_confirmation' => $newPassword,
    ]);

    $response->assertSuccessful();
    $response->assertJson(['success' => true]);

    // Step 4: Verify password was updated and flag was cleared
    $user->refresh();
    expect(Hash::check($newPassword, $user->password))->toBeTrue();
    expect(Hash::check($tempPassword, $user->password))->toBeFalse();
    expect($user->password_change_required)->toBeFalse();

    // Step 5: User can sign in with new password
    expect(Hash::check($newPassword, $user->password))->toBeTrue();
});

it('user cannot use temporary password after changing it', function () {
    $tempPassword = 'TempPass123';
    $newPassword = 'NewSecurePass123';

    $user = User::factory()->create([
        'password' => $tempPassword,
        'password_change_required' => true,
    ]);

    // Change password
    $this->actingAs($user)->patchJson('/api/user/password', [
        'current_password' => $tempPassword,
        'password' => $newPassword,
        'password_confirmation' => $newPassword,
    ])->assertSuccessful();

    // Try to use temporary password again - should fail
    $user->refresh();
    expect(Hash::check($tempPassword, $user->password))->toBeFalse();
    expect(Hash::check($newPassword, $user->password))->toBeTrue();
});

it('password is properly hashed by model cast', function () {
    $plainPassword = 'PlainPassword123';

    // Create user with plain password
    $user = User::factory()->create([
        'password' => $plainPassword,
    ]);

    // Verify it was hashed
    expect($user->password)->not->toBe($plainPassword);
    expect(strlen($user->password))->toBeGreaterThan(50); // Bcrypt hashes are ~60 chars
    expect(Hash::check($plainPassword, $user->password))->toBeTrue();
});

it('validation errors are returned with helpful messages', function () {
    $user = User::factory()->create([
        'password' => 'oldpassword',
    ]);

    // Test password confirmation mismatch
    $response = $this->actingAs($user)->patchJson('/api/user/password', [
        'current_password' => 'oldpassword',
        'password' => 'newpassword',
        'password_confirmation' => 'differentpassword',
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['password']);
    expect($response->json('errors.password'))->toBeArray();
});

it('clears password_change_required flag after successful change', function () {
    $user = User::factory()->create([
        'password' => 'temppass',
        'password_change_required' => true,
    ]);

    expect($user->password_change_required)->toBeTrue();

    $this->actingAs($user)->patchJson('/api/user/password', [
        'current_password' => 'temppass',
        'password' => 'newpassword123',
        'password_confirmation' => 'newpassword123',
    ])->assertSuccessful();

    $user->refresh();
    expect($user->password_change_required)->toBeFalse();
});
