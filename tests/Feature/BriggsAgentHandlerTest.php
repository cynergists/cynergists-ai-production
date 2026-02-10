<?php

use App\Models\BriggsUserSettings;
use App\Models\PortalAvailableAgent;
use App\Models\PortalTenant;
use App\Models\User;
use App\Services\Briggs\BriggsAgentHandler;
use App\Services\EventEmailService;
use App\Services\SlackEscalationService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->tenant = PortalTenant::factory()->create(['user_id' => $this->user->id]);
    $this->agent = PortalAvailableAgent::factory()->create(['name' => 'Briggs']);

    $this->mock(EventEmailService::class)->shouldIgnoreMissing();
});

it('strips DATA markers from the response before returning', function () {
    $handler = new BriggsAgentHandler(
        app(SlackEscalationService::class)
    );

    $reflection = new ReflectionMethod($handler, 'stripInternalMarkers');

    $response = "Great, I've noted your skill level.\n\n[DATA: skill_level=\"intermediate\"]";
    $cleaned = $reflection->invoke($handler, $response);

    expect($cleaned)->toBe("Great, I've noted your skill level.");
});

it('strips ESCALATE markers from the response before returning', function () {
    $handler = new BriggsAgentHandler(
        app(SlackEscalationService::class)
    );

    $reflection = new ReflectionMethod($handler, 'stripInternalMarkers');

    $response = "I'll connect you with our team for billing help.\n\n[ESCALATE: billing]";
    $cleaned = $reflection->invoke($handler, $response);

    expect($cleaned)->toBe("I'll connect you with our team for billing help.");
});

it('strips both DATA and ESCALATE markers from the response', function () {
    $handler = new BriggsAgentHandler(
        app(SlackEscalationService::class)
    );

    $reflection = new ReflectionMethod($handler, 'stripInternalMarkers');

    $response = "Got it, updating your info.\n\n[DATA: skill_level=\"advanced\"]\n\n[ESCALATE: technical]";
    $cleaned = $reflection->invoke($handler, $response);

    expect($cleaned)->toBe('Got it, updating your info.');
});

it('extracts skill level from DATA markers and saves to BriggsUserSettings', function () {
    $handler = new BriggsAgentHandler(
        app(SlackEscalationService::class)
    );

    $reflection = new ReflectionMethod($handler, 'extractAndSaveData');

    $response = 'Sounds good! [DATA: skill_level="intermediate" preferred_industry="SaaS"]';

    $reflection->invoke($handler, $response, $this->user);

    $settings = BriggsUserSettings::forUser($this->user);
    $context = json_decode($settings->briggs_context, true);

    expect($context)->toHaveKey('skill_level', 'intermediate')
        ->toHaveKey('preferred_industry', 'SaaS');
    expect($settings->skill_level)->toBe('intermediate');
    expect($settings->preferred_industry)->toBe('SaaS');
});

it('does not save data when no DATA markers are present', function () {
    $handler = new BriggsAgentHandler(
        app(SlackEscalationService::class)
    );

    $reflection = new ReflectionMethod($handler, 'extractAndSaveData');

    $response = 'Just a normal response with no markers.';

    $reflection->invoke($handler, $response, $this->user);

    $settings = BriggsUserSettings::forUser($this->user);

    expect($settings->briggs_context)->toBeNull();
});

it('triggers escalation when ESCALATE marker is present', function () {
    $mockSlack = $this->mock(SlackEscalationService::class);
    $mockSlack->shouldReceive('escalate')
        ->once()
        ->withArgs(function ($tenant, $user, $reason, $context) {
            return $reason === 'billing' && $context['agent'] === 'briggs';
        });

    $handler = new BriggsAgentHandler($mockSlack);

    $reflection = new ReflectionMethod($handler, 'handleEscalation');

    $response = "I'll get the billing team to help. [ESCALATE: billing]";

    $reflection->invoke($handler, $response, $this->tenant, $this->user, []);
});

it('does not trigger escalation when no ESCALATE marker is present', function () {
    $mockSlack = $this->mock(SlackEscalationService::class);
    $mockSlack->shouldNotReceive('escalate');

    $handler = new BriggsAgentHandler($mockSlack);

    $reflection = new ReflectionMethod($handler, 'handleEscalation');

    $response = 'Just a normal response.';

    $reflection->invoke($handler, $response, $this->tenant, $this->user, []);
});

it('marks onboarding complete when onboarding_confirmed DATA marker is present', function () {
    $handler = new BriggsAgentHandler(
        app(SlackEscalationService::class)
    );

    $reflection = new ReflectionMethod($handler, 'extractAndSaveData');

    $response = 'All set! [DATA: skill_level="advanced" preferred_industry="Healthcare" onboarding_confirmed="true"]';

    $reflection->invoke($handler, $response, $this->user);

    $settings = BriggsUserSettings::forUser($this->user);
    expect($settings->onboarding_completed)->toBeTrue();
    expect($settings->skill_level)->toBe('advanced');
    expect($settings->preferred_industry)->toBe('Healthcare');
});
