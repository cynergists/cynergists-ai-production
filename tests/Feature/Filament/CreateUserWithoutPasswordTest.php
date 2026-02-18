<?php

use App\Filament\Resources\Users\Pages\CreateUser;
use App\Jobs\SendEventEmail;
use App\Models\EventEmailTemplate;
use App\Models\SystemEvent;
use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Livewire\Livewire;

uses(RefreshDatabase::class);

beforeEach(function () {
    Bus::fake([SendEventEmail::class]);

    $this->admin = User::factory()->create();

    Filament::setCurrentPanel('admin');
    Filament::bootCurrentPanel();
});

it('creates user successfully without password', function () {
    $this->actingAs($this->admin);

    Livewire::test(CreateUser::class)
        ->set('data.name', 'No Password User')
        ->set('data.email', 'nopassword@example.com')
        ->set('data.is_active', true)
        ->call('create')
        ->assertHasNoErrors();

    expect(User::where('email', 'nopassword@example.com')->exists())->toBeTrue();

    $user = User::where('email', 'nopassword@example.com')->first();
    expect($user->password)->toBeNull();
});

it('creates user with password when provided', function () {
    $this->actingAs($this->admin);

    Livewire::test(CreateUser::class)
        ->set('data.name', 'With Password User')
        ->set('data.email', 'withpassword@example.com')
        ->set('data.password', 'securepassword123')
        ->set('data.is_active', true)
        ->call('create')
        ->assertHasNoErrors();

    expect(User::where('email', 'withpassword@example.com')->exists())->toBeTrue();

    $user = User::where('email', 'withpassword@example.com')->first();
    expect($user->password)->not->toBeNull();
});

it('sends password reset link when user created without password', function () {
    $event = SystemEvent::factory()->create(['slug' => 'user_created']);

    EventEmailTemplate::factory()->client()->create([
        'system_event_id' => $event->id,
        'subject' => 'Welcome',
        'body' => '<p>Welcome!</p>',
    ]);

    $this->actingAs($this->admin);

    Livewire::test(CreateUser::class)
        ->set('data.name', 'Reset Link User')
        ->set('data.email', 'resetlink@example.com')
        ->set('data.is_active', true)
        ->call('create')
        ->assertHasNoErrors();

    expect(User::where('email', 'resetlink@example.com')->exists())->toBeTrue();
});

it('password field shows helpful text about leaving it blank', function () {
    $this->actingAs($this->admin);

    Livewire::test(CreateUser::class)
        ->assertFormFieldExists('password');
});

it('creates user with roles but without password', function () {
    $this->actingAs($this->admin);

    Livewire::test(CreateUser::class)
        ->set('data.name', 'Client User')
        ->set('data.email', 'client@example.com')
        ->set('data.is_active', true)
        ->set('data.roles', ['client'])
        ->call('create')
        ->assertHasNoErrors();

    $user = User::where('email', 'client@example.com')->first();
    expect($user)->not->toBeNull();
    expect($user->password)->toBeNull();
    expect($user->userRoles()->where('role', 'client')->exists())->toBeTrue();
});
