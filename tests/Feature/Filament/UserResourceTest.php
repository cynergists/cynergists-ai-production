<?php

use App\Filament\Resources\Users\Pages\EditUser;
use App\Filament\Resources\Users\Pages\ViewUser;
use App\Models\Cynergist;
use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Livewire\Livewire;

uses(RefreshDatabase::class);

it('updates a user password from the Filament edit form', function () {
    $admin = User::factory()->create();
    $user = User::factory()->create();

    $this->actingAs($admin);

    Filament::setCurrentPanel('admin');
    Filament::bootCurrentPanel();

    Livewire::test(EditUser::class, ['record' => $user->getKey()])
        ->set('data.name', 'Updated User')
        ->set('data.email', 'updated@example.com')
        ->set('data.is_active', true)
        ->set('data.password', 'new-password')
        ->set('data.password_confirmation', 'new-password')
        ->call('save')
        ->assertHasNoErrors();

    $user->refresh();

    expect(Hash::check('new-password', $user->password))->toBeTrue();
    expect($user->is_active)->toBeTrue();
});

it('sends a password reset link from the edit page', function () {
    Notification::fake();

    $admin = User::factory()->create();
    $user = User::factory()->create();

    $this->actingAs($admin);

    Filament::setCurrentPanel('admin');
    Filament::bootCurrentPanel();

    Livewire::test(EditUser::class, ['record' => $user->getKey()])
        ->callAction('sendPasswordReset')
        ->assertNotified('Password reset link sent');

    Notification::assertSentTo($user, \Illuminate\Auth\Notifications\ResetPassword::class);
});

it('shows connected cynergists on the user view page', function () {
    $admin = User::factory()->create();
    $user = User::factory()->create();
    $cynergists = Cynergist::factory()->count(2)->create();

    $user->cynergists()->attach($cynergists->pluck('id'));

    $this->actingAs($admin);

    Filament::setCurrentPanel('admin');
    Filament::bootCurrentPanel();

    $component = Livewire::test(ViewUser::class, ['record' => $user->getKey()]);

    $cynergists->each(
        fn (Cynergist $cynergist) => $component->assertSee($cynergist->name),
    );
});
