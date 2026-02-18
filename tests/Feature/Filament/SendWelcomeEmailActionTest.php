<?php

use App\Filament\Resources\Users\Pages\EditUser;
use App\Models\User;
use App\Services\EventEmailService;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Livewire\Livewire;

uses(RefreshDatabase::class);

beforeEach(function () {
    Notification::fake();

    $this->admin = User::factory()->create();

    Filament::setCurrentPanel('admin');
    Filament::bootCurrentPanel();
});

it('has send welcome email action on edit user page', function () {
    $user = User::factory()->create();

    $this->actingAs($this->admin);

    Livewire::test(EditUser::class, ['record' => $user->id])
        ->assertActionExists('sendWelcomeEmail');
});

it('shows success notification when welcome email is sent', function () {
    $user = User::factory()->create(['email' => 'test@example.com']);

    $this->actingAs($this->admin);

    Livewire::test(EditUser::class, ['record' => $user->id])
        ->callAction('sendWelcomeEmail')
        ->assertNotified();
});

it('calls event email service with user_created event when action is triggered', function () {
    $user = User::factory()->create(['email' => 'test@example.com']);

    $serviceMock = Mockery::mock(EventEmailService::class);
    $serviceMock->shouldReceive('fire')
        ->once()
        ->with('user_created', Mockery::on(function ($data) use ($user) {
            return isset($data['user']) && $data['user']->id === $user->id;
        }));

    $this->app->instance(EventEmailService::class, $serviceMock);

    $this->actingAs($this->admin);

    Livewire::test(EditUser::class, ['record' => $user->id])
        ->callAction('sendWelcomeEmail');
});

it('can send welcome email to user without password', function () {
    $user = User::factory()->create([
        'email' => 'nopassword@example.com',
        'password' => null,
    ]);

    $this->actingAs($this->admin);

    Livewire::test(EditUser::class, ['record' => $user->id])
        ->callAction('sendWelcomeEmail')
        ->assertNotified();
});

it('can send welcome email to user with existing password', function () {
    $user = User::factory()->create([
        'email' => 'withpassword@example.com',
        'password' => bcrypt('password123'),
    ]);

    $this->actingAs($this->admin);

    Livewire::test(EditUser::class, ['record' => $user->id])
        ->callAction('sendWelcomeEmail')
        ->assertNotified();
});
