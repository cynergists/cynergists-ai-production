<?php

use App\Jobs\SendEventEmail;
use App\Models\EventEmailTemplate;
use App\Models\SystemEvent;
use App\Models\User;
use App\Services\EventEmailService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Log;

require_once __DIR__.'/../../Helpers/MergeTagHelper.php';

uses(RefreshDatabase::class);

beforeEach(function () {
    Bus::fake([SendEventEmail::class]);

    $this->service = app(EventEmailService::class);

    $this->user = User::factory()->create([
        'name' => 'Test User',
        'email' => 'test@example.com',
    ]);
});

it('dispatches jobs for active templates when event fires', function () {
    $event = SystemEvent::factory()->create(['slug' => 'subscription_started']);

    EventEmailTemplate::factory()->client()->create([
        'system_event_id' => $event->id,
        'subject' => 'Welcome {{ user_name }}',
        'body' => '<p>Hello '.mt('user_name').'</p>',
    ]);

    EventEmailTemplate::factory()->admin()->create([
        'system_event_id' => $event->id,
        'subject' => 'New signup: {{ user_email }}',
        'body' => '<p>'.mt('user_email').' signed up</p>',
    ]);

    config(['services.filament.admin_emails' => ['admin@example.com']]);

    $this->service->fire('subscription_started', [
        'user' => $this->user,
    ]);

    Bus::assertDispatched(SendEventEmail::class, 2);
});

it('sends client emails to user email', function () {
    $event = SystemEvent::factory()->create(['slug' => 'test_event']);

    EventEmailTemplate::factory()->client()->create([
        'system_event_id' => $event->id,
        'subject' => 'Hello {{ user_name }}',
        'body' => '<p>Welcome '.mt('user_name').'</p>',
    ]);

    $this->service->fire('test_event', [
        'user' => $this->user,
    ]);

    Bus::assertDispatched(SendEventEmail::class, function (SendEventEmail $job) {
        return $job->recipients === ['test@example.com']
            && $job->renderedSubject === 'Hello Test User'
            && str_contains($job->renderedBody, 'Welcome')
            && str_contains($job->renderedBody, 'Test User');
    });
});

it('sends admin emails to configured admin addresses', function () {
    $event = SystemEvent::factory()->create(['slug' => 'test_event']);

    EventEmailTemplate::factory()->admin()->create([
        'system_event_id' => $event->id,
        'subject' => 'New user: {{ user_email }}',
        'body' => '<p>'.mt('user_email').' joined</p>',
    ]);

    config(['services.filament.admin_emails' => ['admin1@example.com', 'admin2@example.com']]);

    $this->service->fire('test_event', [
        'user' => $this->user,
    ]);

    Bus::assertDispatched(SendEventEmail::class, function (SendEventEmail $job) {
        return $job->recipients === ['admin1@example.com', 'admin2@example.com'];
    });
});

it('skips inactive events', function () {
    $event = SystemEvent::factory()->inactive()->create(['slug' => 'inactive_event']);

    EventEmailTemplate::factory()->client()->create([
        'system_event_id' => $event->id,
    ]);

    $this->service->fire('inactive_event', [
        'user' => $this->user,
    ]);

    Bus::assertNotDispatched(SendEventEmail::class);
});

it('skips inactive templates', function () {
    $event = SystemEvent::factory()->create(['slug' => 'test_event']);

    EventEmailTemplate::factory()->client()->inactive()->create([
        'system_event_id' => $event->id,
    ]);

    EventEmailTemplate::factory()->admin()->create([
        'system_event_id' => $event->id,
    ]);

    config(['services.filament.admin_emails' => ['admin@example.com']]);

    $this->service->fire('test_event', [
        'user' => $this->user,
    ]);

    Bus::assertDispatched(SendEventEmail::class, 1);
});

it('logs a warning for unknown event slugs', function () {
    Log::shouldReceive('warning')
        ->once()
        ->withArgs(function (string $message, array $context) {
            return $message === 'System event not found or inactive'
                && $context['slug'] === 'nonexistent_event';
        });

    $this->service->fire('nonexistent_event', [
        'user' => $this->user,
    ]);

    Bus::assertNotDispatched(SendEventEmail::class);
});

it('renders all standard variables correctly', function () {
    $event = SystemEvent::factory()->create(['slug' => 'test_event']);

    EventEmailTemplate::factory()->client()->create([
        'system_event_id' => $event->id,
        'subject' => '{{ agent_name }} for {{ user_name }}',
        'body' => '<p>'.mt('user_name').' '.mt('user_email').' '.mt('agent_name').' '.mt('agent_description').' '.mt('agent_job_title').' '.mt('tier').' '.mt('start_date').' '.mt('company_name').' '.mt('app_name').' '.mt('app_url').'</p>',
    ]);

    $tenant = \App\Models\PortalTenant::factory()->create([
        'user_id' => $this->user->id,
        'company_name' => 'Acme Corp',
    ]);

    $agent = \App\Models\PortalAvailableAgent::factory()->create([
        'name' => 'Sales Bot',
        'description' => 'A helpful sales agent',
        'job_title' => 'Sales Manager',
    ]);

    $subscription = \App\Models\CustomerSubscription::factory()->create([
        'tenant_id' => $tenant->id,
        'customer_id' => $tenant->id,
        'tier' => 'pro',
        'start_date' => '2026-01-15',
    ]);

    config(['app.name' => 'Cynergists', 'app.url' => 'https://cynergists.ai']);

    $this->service->fire('test_event', [
        'user' => $this->user,
        'agent' => $agent,
        'subscription' => $subscription,
        'tenant' => $tenant,
    ]);

    Bus::assertDispatched(SendEventEmail::class, function (SendEventEmail $job) {
        return $job->renderedSubject === 'Sales Bot for Test User'
            && str_contains($job->renderedBody, 'Test User')
            && str_contains($job->renderedBody, 'test@example.com')
            && str_contains($job->renderedBody, 'Sales Bot')
            && str_contains($job->renderedBody, 'A helpful sales agent')
            && str_contains($job->renderedBody, 'Sales Manager')
            && str_contains($job->renderedBody, 'pro')
            && str_contains($job->renderedBody, 'January 15, 2026')
            && str_contains($job->renderedBody, 'Acme Corp')
            && str_contains($job->renderedBody, 'Cynergists')
            && str_contains($job->renderedBody, 'https://cynergists.ai');
    });
});

it('does not dispatch when client template has no user', function () {
    $event = SystemEvent::factory()->create(['slug' => 'test_event']);

    EventEmailTemplate::factory()->client()->create([
        'system_event_id' => $event->id,
    ]);

    $this->service->fire('test_event', []);

    Bus::assertNotDispatched(SendEventEmail::class);
});

it('does not dispatch admin email when no admin emails configured', function () {
    $event = SystemEvent::factory()->create(['slug' => 'test_event']);

    EventEmailTemplate::factory()->admin()->create([
        'system_event_id' => $event->id,
    ]);

    config(['services.filament.admin_emails' => []]);

    $this->service->fire('test_event', [
        'user' => $this->user,
    ]);

    Bus::assertNotDispatched(SendEventEmail::class);
});
