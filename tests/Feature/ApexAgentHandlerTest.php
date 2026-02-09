<?php

use App\Models\ApexUserSettings;
use App\Models\PortalAvailableAgent;
use App\Models\PortalTenant;
use App\Models\User;
use App\Services\Apex\ApexAgentHandler;
use App\Services\EventEmailService;
use App\Services\SlackEscalationService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->tenant = PortalTenant::factory()->create(['user_id' => $this->user->id]);
    $this->agent = PortalAvailableAgent::factory()->create(['name' => 'Apex']);

    $this->mock(EventEmailService::class)->shouldIgnoreMissing();
});

it('strips DATA markers from the response before returning', function () {
    $handler = new ApexAgentHandler(
        app(SlackEscalationService::class)
    );

    $reflection = new ReflectionMethod($handler, 'stripInternalMarkers');

    $response = "Great, I've noted your campaign name.\n\n[DATA: campaign_name=\"IT Directors Denver\"]";
    $cleaned = $reflection->invoke($handler, $response);

    expect($cleaned)->toBe("Great, I've noted your campaign name.");
});

it('strips ESCALATE markers from the response before returning', function () {
    $handler = new ApexAgentHandler(
        app(SlackEscalationService::class)
    );

    $reflection = new ReflectionMethod($handler, 'stripInternalMarkers');

    $response = "I'll connect you with our team for billing help.\n\n[ESCALATE: billing]";
    $cleaned = $reflection->invoke($handler, $response);

    expect($cleaned)->toBe("I'll connect you with our team for billing help.");
});

it('strips both DATA and ESCALATE markers from the response', function () {
    $handler = new ApexAgentHandler(
        app(SlackEscalationService::class)
    );

    $reflection = new ReflectionMethod($handler, 'stripInternalMarkers');

    $response = "Got it, updating your info.\n\n[DATA: campaign_name=\"Test\"]\n\n[ESCALATE: technical]";
    $cleaned = $reflection->invoke($handler, $response);

    expect($cleaned)->toBe('Got it, updating your info.');
});

it('extracts campaign data from DATA markers and saves to ApexUserSettings', function () {
    $handler = new ApexAgentHandler(
        app(SlackEscalationService::class)
    );

    $reflection = new ReflectionMethod($handler, 'extractAndSaveCampaignData');

    $response = 'Sounds good! [DATA: campaign_name="IT Directors Denver" job_titles="CTO, VP Engineering" locations="Denver CO"]';

    $reflection->invoke($handler, $response, $this->user);

    $settings = ApexUserSettings::forUser($this->user);
    $context = json_decode($settings->apex_context, true);

    expect($context)->toHaveKey('campaign_name', 'IT Directors Denver')
        ->toHaveKey('job_titles', 'CTO, VP Engineering')
        ->toHaveKey('locations', 'Denver CO');
});

it('does not save data when no DATA markers are present', function () {
    $handler = new ApexAgentHandler(
        app(SlackEscalationService::class)
    );

    $reflection = new ReflectionMethod($handler, 'extractAndSaveCampaignData');

    $response = 'Just a normal response with no markers.';

    $reflection->invoke($handler, $response, $this->user);

    $settings = ApexUserSettings::forUser($this->user);

    expect($settings->apex_context)->toBeNull();
});

it('triggers escalation when ESCALATE marker is present', function () {
    $mockSlack = $this->mock(SlackEscalationService::class);
    $mockSlack->shouldReceive('escalate')
        ->once()
        ->withArgs(function ($tenant, $user, $reason, $context) {
            return $reason === 'billing' && $context['agent'] === 'apex';
        });

    $handler = new ApexAgentHandler($mockSlack);

    $reflection = new ReflectionMethod($handler, 'handleEscalation');

    $response = "I'll get the billing team to help. [ESCALATE: billing]";

    $reflection->invoke($handler, $response, $this->tenant, $this->user, []);
});

it('does not trigger escalation when no ESCALATE marker is present', function () {
    $mockSlack = $this->mock(SlackEscalationService::class);
    $mockSlack->shouldNotReceive('escalate');

    $handler = new ApexAgentHandler($mockSlack);

    $reflection = new ReflectionMethod($handler, 'handleEscalation');

    $response = 'Just a normal response.';

    $reflection->invoke($handler, $response, $this->tenant, $this->user, []);
});
