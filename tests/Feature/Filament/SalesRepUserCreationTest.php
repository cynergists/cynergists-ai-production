<?php

use App\Filament\Resources\Users\Pages\CreateUser;
use App\Jobs\SendEventEmail;
use App\Models\EventEmailTemplate;
use App\Models\SystemEvent;
use App\Models\User;
use App\Models\UserRole;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Livewire\Livewire;

require_once __DIR__.'/../../Helpers/MergeTagHelper.php';

uses(RefreshDatabase::class);

beforeEach(function () {
    Bus::fake([SendEventEmail::class]);

    // Create a sales rep user
    $this->salesRep = User::factory()->create([
        'email' => 'salesrep@cynergists.com',
        'name' => 'Test Sales Rep',
    ]);
    UserRole::create([
        'user_id' => $this->salesRep->id,
        'role' => 'sales_rep',
    ]);

    Filament::setCurrentPanel('admin');
    Filament::bootCurrentPanel();
});

it('allows sales rep to access Filament admin panel', function () {
    expect($this->salesRep->canAccessPanel(Filament::getCurrentPanel()))->toBeTrue();
});

it('denies non-admin and non-sales rep users from accessing Filament', function () {
    $client = User::factory()->create();
    UserRole::create([
        'user_id' => $client->id,
        'role' => 'client',
    ]);

    expect($client->canAccessPanel(Filament::getCurrentPanel()))->toBeFalse();
});

it('sends welcome email with password reset link when sales rep creates user without password', function () {
    $event = SystemEvent::factory()->create(['slug' => 'user_created']);

    EventEmailTemplate::factory()->client()->create([
        'system_event_id' => $event->id,
        'subject' => 'Welcome {{ user_name }}',
        'body' => '<p>Welcome! Reset link: '.mt('password_reset_url').'</p>',
    ]);

    $this->actingAs($this->salesRep);

    Livewire::test(CreateUser::class)
        ->set('data.name', 'New User')
        ->set('data.email', 'newuser@example.com')
        ->set('data.is_active', true)
        ->set('data.roles', ['client'])
        ->call('create')
        ->assertHasNoErrors();

    // Verify welcome email was dispatched with password reset link
    Bus::assertDispatched(SendEventEmail::class, function (SendEventEmail $job) {
        return $job->recipients === ['newuser@example.com']
            && str_contains($job->renderedBody, 'Reset link:')
            && str_contains($job->renderedBody, 'reset-password');
    });
});

it('sends welcome email with password when sales rep creates user with password', function () {
    $event = SystemEvent::factory()->create(['slug' => 'user_created']);

    EventEmailTemplate::factory()->client()->create([
        'system_event_id' => $event->id,
        'subject' => 'Welcome {{ user_name }}',
        'body' => '<p>Welcome! Your password is: '.mt('password').'</p>',
    ]);

    $this->actingAs($this->salesRep);

    Livewire::test(CreateUser::class)
        ->set('data.name', 'New User')
        ->set('data.email', 'newuser@example.com')
        ->set('data.password', 'TempPass123')
        ->set('data.is_active', true)
        ->set('data.roles', ['client'])
        ->call('create')
        ->assertHasNoErrors();

    // Verify welcome email was dispatched with password
    Bus::assertDispatched(SendEventEmail::class, function (SendEventEmail $job) {
        return $job->recipients === ['newuser@example.com']
            && str_contains($job->renderedBody, 'TempPass123');
    });
});

it('creates user without password when field is left blank', function () {
    $event = SystemEvent::factory()->create(['slug' => 'user_created']);

    EventEmailTemplate::factory()->client()->create([
        'system_event_id' => $event->id,
        'subject' => 'Welcome',
        'body' => '<p>Welcome!</p>',
    ]);

    $this->actingAs($this->salesRep);

    Livewire::test(CreateUser::class)
        ->set('data.name', 'User Without Password')
        ->set('data.email', 'nopass@example.com')
        ->set('data.is_active', true)
        ->set('data.roles', ['client'])
        ->call('create')
        ->assertHasNoErrors();

    $user = User::where('email', 'nopass@example.com')->first();

    expect($user)->not->toBeNull();
    expect($user->name)->toBe('User Without Password');
    // User exists but will set password via reset link
});

it('creates user with password when field is provided', function () {
    $event = SystemEvent::factory()->create(['slug' => 'user_created']);

    EventEmailTemplate::factory()->client()->create([
        'system_event_id' => $event->id,
        'subject' => 'Welcome',
        'body' => '<p>Welcome!</p>',
    ]);

    $this->actingAs($this->salesRep);

    Livewire::test(CreateUser::class)
        ->set('data.name', 'User With Password')
        ->set('data.email', 'withpass@example.com')
        ->set('data.password', 'SecurePassword123')
        ->set('data.is_active', true)
        ->set('data.roles', ['client'])
        ->call('create')
        ->assertHasNoErrors();

    $user = User::where('email', 'withpass@example.com')->first();

    expect($user)->not->toBeNull();
    expect(\Illuminate\Support\Facades\Hash::check('SecurePassword123', $user->password))->toBeTrue();
});

it('assigns correct roles when creating user', function () {
    $event = SystemEvent::factory()->create(['slug' => 'user_created']);

    EventEmailTemplate::factory()->client()->create([
        'system_event_id' => $event->id,
        'subject' => 'Welcome',
        'body' => '<p>Welcome!</p>',
    ]);

    $this->actingAs($this->salesRep);

    Livewire::test(CreateUser::class)
        ->set('data.name', 'Multi-Role User')
        ->set('data.email', 'multirole@example.com')
        ->set('data.is_active', true)
        ->set('data.roles', ['admin', 'sales_rep'])
        ->call('create')
        ->assertHasNoErrors();

    $user = User::where('email', 'multirole@example.com')->first();
    $roles = $user->userRoles->pluck('role')->toArray();

    expect($roles)->toContain('client');
    expect($roles)->toContain('admin');
    expect($roles)->toContain('sales_rep');
    expect(count($roles))->toBe(3);
});

it('creates user successfully even if welcome email event does not exist', function () {
    $this->actingAs($this->salesRep);

    Livewire::test(CreateUser::class)
        ->set('data.name', 'Test User')
        ->set('data.email', 'test@example.com')
        ->set('data.is_active', true)
        ->set('data.roles', ['client'])
        ->call('create')
        ->assertHasNoErrors();

    $user = User::where('email', 'test@example.com')->first();

    expect($user)->not->toBeNull();

    // No welcome email should be dispatched when event doesn't exist
    Bus::assertNotDispatched(SendEventEmail::class);
});

it('creates user successfully as admin role', function () {
    $admin = User::factory()->create();
    UserRole::create([
        'user_id' => $admin->id,
        'role' => 'admin',
    ]);

    $event = SystemEvent::factory()->create(['slug' => 'user_created']);

    EventEmailTemplate::factory()->client()->create([
        'system_event_id' => $event->id,
        'subject' => 'Welcome',
        'body' => '<p>Welcome!</p>',
    ]);

    $this->actingAs($admin);

    Livewire::test(CreateUser::class)
        ->set('data.name', 'Admin Created User')
        ->set('data.email', 'admincreated@example.com')
        ->set('data.is_active', true)
        ->set('data.roles', ['client'])
        ->call('create')
        ->assertHasNoErrors();

    $user = User::where('email', 'admincreated@example.com')->first();

    expect($user)->not->toBeNull();

    // Welcome email should be dispatched
    Bus::assertDispatched(SendEventEmail::class);
});
