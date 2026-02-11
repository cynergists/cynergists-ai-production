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

require_once __DIR__.'/../../Helpers/MergeTagHelper.php';

uses(RefreshDatabase::class);

beforeEach(function () {
    Bus::fake([SendEventEmail::class]);

    $this->admin = User::factory()->create();

    Filament::setCurrentPanel('admin');
    Filament::bootCurrentPanel();
});

it('dispatches welcome email job when user is created in Filament', function () {
    $event = SystemEvent::factory()->create(['slug' => 'user_created']);

    EventEmailTemplate::factory()->client()->create([
        'system_event_id' => $event->id,
        'subject' => 'Welcome {{ user_name }}',
        'body' => '<p>Hello '.mt('user_name').'</p>',
    ]);

    $this->actingAs($this->admin);

    Livewire::test(CreateUser::class)
        ->set('data.name', 'John Doe')
        ->set('data.email', 'john@example.com')
        ->set('data.password', 'password123')
        ->set('data.password_confirmation', 'password123')
        ->set('data.is_active', true)
        ->set('data.roles', ['client'])
        ->call('create')
        ->assertHasNoErrors();

    Bus::assertDispatched(SendEventEmail::class);
});

it('sends client welcome email to user email address', function () {
    $event = SystemEvent::factory()->create(['slug' => 'user_created']);

    EventEmailTemplate::factory()->client()->create([
        'system_event_id' => $event->id,
        'subject' => 'Welcome {{ user_name }}',
        'body' => '<p>Hello '.mt('user_name').', your email is '.mt('user_email').'</p>',
    ]);

    $this->actingAs($this->admin);

    Livewire::test(CreateUser::class)
        ->set('data.name', 'Jane Smith')
        ->set('data.email', 'jane@example.com')
        ->set('data.password', 'password123')
        ->set('data.password_confirmation', 'password123')
        ->set('data.is_active', true)
        ->set('data.roles', ['client'])
        ->call('create')
        ->assertHasNoErrors();

    Bus::assertDispatched(SendEventEmail::class, function (SendEventEmail $job) {
        return $job->recipients === ['jane@example.com']
            && $job->renderedSubject === 'Welcome Jane Smith'
            && str_contains($job->renderedBody, 'Jane Smith')
            && str_contains($job->renderedBody, 'jane@example.com');
    });
});

it('sends admin notification to configured admin addresses', function () {
    $event = SystemEvent::factory()->create(['slug' => 'user_created']);

    EventEmailTemplate::factory()->client()->create([
        'system_event_id' => $event->id,
        'subject' => 'Welcome {{ user_name }}',
        'body' => '<p>Welcome</p>',
    ]);

    EventEmailTemplate::factory()->admin()->create([
        'system_event_id' => $event->id,
        'subject' => 'New user: {{ user_name }}',
        'body' => '<p>New user: '.mt('user_name').' ('.mt('user_email').')</p>',
    ]);

    config(['services.filament.admin_emails' => ['admin1@example.com', 'admin2@example.com']]);

    $this->actingAs($this->admin);

    Livewire::test(CreateUser::class)
        ->set('data.name', 'Bob Johnson')
        ->set('data.email', 'bob@example.com')
        ->set('data.password', 'password123')
        ->set('data.password_confirmation', 'password123')
        ->set('data.is_active', true)
        ->set('data.roles', ['client'])
        ->call('create')
        ->assertHasNoErrors();

    Bus::assertDispatched(SendEventEmail::class, 2);

    Bus::assertDispatched(SendEventEmail::class, function (SendEventEmail $job) {
        return $job->recipients === ['admin1@example.com', 'admin2@example.com']
            && $job->renderedSubject === 'New user: Bob Johnson';
    });
});

it('renders merge tags correctly in welcome email', function () {
    $event = SystemEvent::factory()->create(['slug' => 'user_created']);

    EventEmailTemplate::factory()->client()->create([
        'system_event_id' => $event->id,
        'subject' => 'Welcome to {{ app_name }}, {{ user_name }}!',
        'body' => '<p>Hi '.mt('user_name').'! Your email is '.mt('user_email').'. Visit '.mt('app_url').'</p>',
    ]);

    config(['app.name' => 'Cynergists AI', 'app.url' => 'https://cynergists.ai']);

    $this->actingAs($this->admin);

    Livewire::test(CreateUser::class)
        ->set('data.name', 'Alice Cooper')
        ->set('data.email', 'alice@example.com')
        ->set('data.password', 'password123')
        ->set('data.password_confirmation', 'password123')
        ->set('data.is_active', true)
        ->set('data.roles', ['client'])
        ->call('create')
        ->assertHasNoErrors();

    Bus::assertDispatched(SendEventEmail::class, function (SendEventEmail $job) {
        return $job->renderedSubject === 'Welcome to Cynergists AI, Alice Cooper!'
            && str_contains($job->renderedBody, 'Alice Cooper')
            && str_contains($job->renderedBody, 'alice@example.com')
            && str_contains($job->renderedBody, 'https://cynergists.ai');
    });
});

it('does not send admin email when no admin emails configured', function () {
    $event = SystemEvent::factory()->create(['slug' => 'user_created']);

    EventEmailTemplate::factory()->client()->create([
        'system_event_id' => $event->id,
        'subject' => 'Welcome',
        'body' => '<p>Welcome</p>',
    ]);

    EventEmailTemplate::factory()->admin()->create([
        'system_event_id' => $event->id,
        'subject' => 'New user',
        'body' => '<p>New user</p>',
    ]);

    config(['services.filament.admin_emails' => []]);

    $this->actingAs($this->admin);

    Livewire::test(CreateUser::class)
        ->set('data.name', 'Charlie Brown')
        ->set('data.email', 'charlie@example.com')
        ->set('data.password', 'password123')
        ->set('data.password_confirmation', 'password123')
        ->set('data.is_active', true)
        ->set('data.roles', ['client'])
        ->call('create')
        ->assertHasNoErrors();

    Bus::assertDispatched(SendEventEmail::class, 1);
});

it('creates user successfully even if event does not exist', function () {
    $this->actingAs($this->admin);

    Livewire::test(CreateUser::class)
        ->set('data.name', 'David Lee')
        ->set('data.email', 'david@example.com')
        ->set('data.password', 'password123')
        ->set('data.password_confirmation', 'password123')
        ->set('data.is_active', true)
        ->set('data.roles', ['client'])
        ->call('create')
        ->assertHasNoErrors();

    expect(User::where('email', 'david@example.com')->exists())->toBeTrue();

    Bus::assertNotDispatched(SendEventEmail::class);
});
