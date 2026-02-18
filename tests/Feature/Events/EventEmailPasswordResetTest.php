<?php

use App\Jobs\SendEventEmail;
use App\Models\EventEmailTemplate;
use App\Models\SystemEvent;
use App\Models\User;
use App\Services\EventEmailService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;

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

it('includes password reset URL when generate_password_reset_link is true', function () {
    $event = SystemEvent::factory()->create(['slug' => 'user_created']);

    EventEmailTemplate::factory()->client()->create([
        'system_event_id' => $event->id,
        'subject' => 'Welcome',
        'body' => '<p>Reset: '.mt('password_reset_url').'</p>',
    ]);

    $this->service->fire('user_created', [
        'user' => $this->user,
        'generate_password_reset_link' => true,
    ]);

    Bus::assertDispatched(SendEventEmail::class);

    $job = Bus::dispatched(SendEventEmail::class)->first();
    expect($job->renderedBody)->toContain('/welcome');
    expect($job->renderedBody)->toContain('token=');
    expect($job->renderedBody)->toContain('email=');
});

it('does not include password reset URL when generate_password_reset_link is false', function () {
    $event = SystemEvent::factory()->create(['slug' => 'user_created']);

    EventEmailTemplate::factory()->client()->create([
        'system_event_id' => $event->id,
        'subject' => 'Welcome',
        'body' => '<p>URL: '.mt('password_reset_url').'</p>',
    ]);

    $this->service->fire('user_created', [
        'user' => $this->user,
        'generate_password_reset_link' => false,
    ]);

    Bus::assertDispatched(SendEventEmail::class);

    $job = Bus::dispatched(SendEventEmail::class)->first();
    expect($job->renderedBody)->toContain('URL:');
    expect($job->renderedBody)->not->toContain('/welcome?token=');
});

it('does not include password reset URL when flag is not provided', function () {
    $event = SystemEvent::factory()->create(['slug' => 'user_created']);

    EventEmailTemplate::factory()->client()->create([
        'system_event_id' => $event->id,
        'subject' => 'Welcome',
        'body' => '<p>URL: '.mt('password_reset_url').'</p>',
    ]);

    $this->service->fire('user_created', [
        'user' => $this->user,
    ]);

    Bus::assertDispatched(SendEventEmail::class);

    $job = Bus::dispatched(SendEventEmail::class)->first();
    expect($job->renderedBody)->toContain('URL:');
    expect($job->renderedBody)->not->toContain('/welcome?token=');
});

it('generates valid password reset token', function () {
    $event = SystemEvent::factory()->create(['slug' => 'user_created']);

    EventEmailTemplate::factory()->client()->create([
        'system_event_id' => $event->id,
        'subject' => 'Welcome',
        'body' => '<p>'.mt('password_reset_url').'</p>',
    ]);

    $this->service->fire('user_created', [
        'user' => $this->user,
        'generate_password_reset_link' => true,
    ]);

    Bus::assertDispatched(SendEventEmail::class);

    $job = Bus::dispatched(SendEventEmail::class)->first();
    preg_match('/welcome\?token=([a-f0-9]+)&amp;email=/', $job->renderedBody, $matches);
    expect($matches)->toHaveKey(1);
    expect(strlen($matches[1]))->toBeGreaterThan(20);
});
