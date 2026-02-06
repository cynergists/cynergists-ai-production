<?php

use App\Models\PortalTenant;
use App\Models\User;
use App\Services\SlackEscalationService;
use Illuminate\Support\Facades\Http;

it('sends escalation to slack when configured', function () {
    Http::fake([
        'slack.com/api/chat.postMessage' => Http::response(['ok' => true], 200),
    ]);

    $user = User::factory()->create(['name' => 'Jane Doe', 'email' => 'jane@example.com']);
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
        'company_name' => 'Acme Corp',
    ]);

    $service = new SlackEscalationService('xoxb-test-token', '#escalations');

    $result = $service->escalate($tenant, $user, 'billing', [
        'conversation_excerpt' => [
            ['role' => 'user', 'content' => 'How much does it cost?'],
            ['role' => 'assistant', 'content' => 'Let me connect you with our team.'],
        ],
    ]);

    expect($result)->toBeTrue();

    Http::assertSent(function ($request) {
        return $request->url() === 'https://slack.com/api/chat.postMessage'
            && str_contains($request['text'], 'Billing')
            && str_contains($request['text'], 'Jane Doe')
            && str_contains($request['text'], 'Acme Corp');
    });
});

it('gracefully skips when slack is not configured', function () {
    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
    ]);

    $service = new SlackEscalationService(null, null);

    $result = $service->escalate($tenant, $user, 'billing');

    expect($result)->toBeFalse();
});

it('returns false when slack api responds with error', function () {
    Http::fake([
        'slack.com/api/chat.postMessage' => Http::response(['ok' => false, 'error' => 'channel_not_found'], 200),
    ]);

    $user = User::factory()->create();
    $tenant = PortalTenant::factory()->create([
        'user_id' => (string) $user->id,
    ]);

    $service = new SlackEscalationService('xoxb-test-token', '#invalid');

    $result = $service->escalate($tenant, $user, 'human_request');

    expect($result)->toBeFalse();
});

it('reports configuration status correctly', function () {
    $configured = new SlackEscalationService('xoxb-token', '#channel');
    expect($configured->isConfigured())->toBeTrue();

    $unconfigured = new SlackEscalationService('', '');
    expect($unconfigured->isConfigured())->toBeFalse();

    $partial = new SlackEscalationService('xoxb-token', '');
    expect($partial->isConfigured())->toBeFalse();
});
