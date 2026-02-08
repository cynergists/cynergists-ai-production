<?php

use App\Http\Middleware\EnsureAdminUser;
use App\Models\User;
use App\Models\UserRole;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;

uses(RefreshDatabase::class);

it('blocks non-admin users', function () {
    Route::middleware([EnsureAdminUser::class])
        ->get('/admin/middleware-test', fn () => 'ok');

    $user = User::factory()->create();

    UserRole::factory()->create([
        'user_id' => $user->id,
        'role' => 'client',
    ]);

    $this->actingAs($user)
        ->get('/admin/middleware-test')
        ->assertForbidden();
});

it('allows admin users', function () {
    Route::middleware([EnsureAdminUser::class])
        ->get('/admin/middleware-test-allowed', fn () => 'ok');

    $user = User::factory()->create();

    UserRole::factory()->create([
        'user_id' => $user->id,
        'role' => 'admin',
    ]);

    $this->actingAs($user)
        ->get('/admin/middleware-test-allowed')
        ->assertOk();
});

it('denies filament panel access to non-admin users', function () {
    $user = User::factory()->create();

    UserRole::factory()->create([
        'user_id' => $user->id,
        'role' => 'client',
    ]);

    $panel = Filament::getPanel('admin');

    expect($user->canAccessPanel($panel))->toBeFalse();
});

it('grants filament panel access to admin users', function () {
    $user = User::factory()->create();

    UserRole::factory()->create([
        'user_id' => $user->id,
        'role' => 'admin',
    ]);

    $panel = Filament::getPanel('admin');

    expect($user->canAccessPanel($panel))->toBeTrue();
});
