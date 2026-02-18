<?php

use App\Jobs\Apex\RunCampaignPipelineJob;
use App\Models\ApexCampaign;
use App\Models\ApexCampaignProspect;
use App\Models\ApexLinkedInAccount;
use App\Models\ApexProspect;
use App\Models\PortalAvailableAgent;
use App\Models\User;
use App\Services\Apex\UnipileService;
use App\Services\EventEmailService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Collection;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->mock(EventEmailService::class)->shouldIgnoreMissing();

    $this->user = User::factory()->create();
    $this->agent = PortalAvailableAgent::factory()->create(['name' => 'Apex']);
    $this->linkedInAccount = ApexLinkedInAccount::factory()->create([
        'user_id' => $this->user->id,
        'status' => 'active',
    ]);
    $this->campaign = ApexCampaign::factory()->active()->create([
        'user_id' => $this->user->id,
        'job_titles' => ['CEO', 'CTO'],
        'locations' => ['Denver, CO'],
        'industries' => ['Technology'],
        'daily_connection_limit' => 25,
    ]);
});

it('discovers prospects from LinkedIn search results', function () {
    $mockResults = new Collection([
        [
            'provider_id' => 'profile-123',
            'linkedin_url' => 'https://www.linkedin.com/in/john-doe',
            'first_name' => 'John',
            'last_name' => 'Doe',
            'headline' => 'CEO at TechCo',
            'company' => 'TechCo',
            'job_title' => 'CEO',
            'location' => 'Denver, CO',
        ],
        [
            'provider_id' => 'profile-456',
            'linkedin_url' => 'https://www.linkedin.com/in/jane-smith',
            'first_name' => 'Jane',
            'last_name' => 'Smith',
            'headline' => 'CTO at StartupInc',
            'company' => 'StartupInc',
            'job_title' => 'CTO',
            'location' => 'Denver, CO',
        ],
    ]);

    $mock = $this->mock(UnipileService::class);
    $mock->shouldReceive('forAgent')->andReturnSelf();
    $mock->shouldReceive('isConfigured')->andReturn(true);
    $mock->shouldReceive('searchProfiles')->once()->andReturn($mockResults);

    $job = new RunCampaignPipelineJob($this->campaign, $this->agent);
    $job->handle(app(UnipileService::class));

    expect(ApexProspect::where('user_id', $this->user->id)->count())->toBe(2);
    expect(ApexCampaignProspect::where('campaign_id', $this->campaign->id)->count())->toBe(2);
    expect(ApexCampaignProspect::where('campaign_id', $this->campaign->id)->first()->status)->toBe('queued');
});

it('skips duplicate prospects already in the campaign', function () {
    $existingProspect = ApexProspect::factory()->create([
        'user_id' => $this->user->id,
        'linkedin_profile_id' => 'profile-123',
    ]);

    ApexCampaignProspect::factory()->create([
        'campaign_id' => $this->campaign->id,
        'prospect_id' => $existingProspect->id,
    ]);

    $mockResults = new Collection([
        [
            'provider_id' => 'profile-123',
            'linkedin_url' => 'https://www.linkedin.com/in/john-doe',
            'first_name' => 'John',
            'last_name' => 'Doe',
        ],
        [
            'provider_id' => 'profile-new',
            'linkedin_url' => 'https://www.linkedin.com/in/new-person',
            'first_name' => 'New',
            'last_name' => 'Person',
        ],
    ]);

    $mock = $this->mock(UnipileService::class);
    $mock->shouldReceive('forAgent')->andReturnSelf();
    $mock->shouldReceive('isConfigured')->andReturn(true);
    $mock->shouldReceive('searchProfiles')->once()->andReturn($mockResults);

    $job = new RunCampaignPipelineJob($this->campaign, $this->agent);
    $job->handle(app(UnipileService::class));

    // Should only create 1 new campaign-prospect, not duplicate the existing one
    expect(ApexCampaignProspect::where('campaign_id', $this->campaign->id)->count())->toBe(2);
    expect(ApexProspect::where('user_id', $this->user->id)->count())->toBe(2);
});

it('reuses existing prospect records for known linkedin_profile_id', function () {
    $existingProspect = ApexProspect::factory()->create([
        'user_id' => $this->user->id,
        'linkedin_profile_id' => 'profile-123',
    ]);

    $mockResults = new Collection([
        [
            'provider_id' => 'profile-123',
            'linkedin_url' => 'https://www.linkedin.com/in/john-doe',
            'first_name' => 'John',
            'last_name' => 'Doe',
        ],
    ]);

    $mock = $this->mock(UnipileService::class);
    $mock->shouldReceive('forAgent')->andReturnSelf();
    $mock->shouldReceive('isConfigured')->andReturn(true);
    $mock->shouldReceive('searchProfiles')->once()->andReturn($mockResults);

    $job = new RunCampaignPipelineJob($this->campaign, $this->agent);
    $job->handle(app(UnipileService::class));

    // Should not create a new prospect, should reuse the existing one
    expect(ApexProspect::where('user_id', $this->user->id)->count())->toBe(1);
    expect(ApexCampaignProspect::where('campaign_id', $this->campaign->id)->first()->prospect_id)->toBe($existingProspect->id);
});

it('skips inactive campaigns', function () {
    $inactiveCampaign = ApexCampaign::factory()->paused()->create([
        'user_id' => $this->user->id,
    ]);

    $mock = $this->mock(UnipileService::class);
    $mock->shouldNotReceive('searchProfiles');

    $job = new RunCampaignPipelineJob($inactiveCampaign, $this->agent);
    $job->handle(app(UnipileService::class));

    expect(ApexCampaignProspect::where('campaign_id', $inactiveCampaign->id)->count())->toBe(0);
});

it('skips when no active LinkedIn account', function () {
    $this->linkedInAccount->update(['status' => 'disconnected']);

    $mock = $this->mock(UnipileService::class);
    $mock->shouldNotReceive('searchProfiles');

    $job = new RunCampaignPipelineJob($this->campaign, $this->agent);
    $job->handle(app(UnipileService::class));

    expect(ApexCampaignProspect::where('campaign_id', $this->campaign->id)->count())->toBe(0);
});

it('skips when campaign has no targeting criteria', function () {
    $emptyCampaign = ApexCampaign::factory()->active()->create([
        'user_id' => $this->user->id,
        'job_titles' => [],
        'locations' => [],
        'industries' => [],
        'keywords' => [],
    ]);

    $mock = $this->mock(UnipileService::class);
    $mock->shouldReceive('forAgent')->andReturnSelf();
    $mock->shouldReceive('isConfigured')->andReturn(true);
    $mock->shouldNotReceive('searchProfiles');

    $job = new RunCampaignPipelineJob($emptyCampaign, $this->agent);
    $job->handle(app(UnipileService::class));

    expect(ApexCampaignProspect::where('campaign_id', $emptyCampaign->id)->count())->toBe(0);
});

it('limits discovery to daily_connection_limit', function () {
    $campaign = ApexCampaign::factory()->active()->create([
        'user_id' => $this->user->id,
        'job_titles' => ['CEO'],
        'daily_connection_limit' => 5,
    ]);

    $limitUsed = null;

    $mock = $this->mock(UnipileService::class);
    $mock->shouldReceive('forAgent')->andReturnSelf();
    $mock->shouldReceive('isConfigured')->andReturn(true);
    $mock->shouldReceive('searchProfiles')
        ->withArgs(function ($accountId, $filters, $limit) use (&$limitUsed) {
            $limitUsed = $limit;

            return true;
        })
        ->andReturn(new Collection([]));

    $job = new RunCampaignPipelineJob($campaign, $this->agent);
    $job->handle(app(UnipileService::class));

    expect($limitUsed)->toBe(5);
});

it('logs activity when prospects are discovered', function () {
    $mockResults = new Collection([
        [
            'provider_id' => 'profile-999',
            'linkedin_url' => 'https://www.linkedin.com/in/test-user',
            'first_name' => 'Test',
            'last_name' => 'User',
        ],
    ]);

    $mock = $this->mock(UnipileService::class);
    $mock->shouldReceive('forAgent')->andReturnSelf();
    $mock->shouldReceive('isConfigured')->andReturn(true);
    $mock->shouldReceive('searchProfiles')->once()->andReturn($mockResults);

    $job = new RunCampaignPipelineJob($this->campaign, $this->agent);
    $job->handle(app(UnipileService::class));

    $this->assertDatabaseHas('apex_activity_log', [
        'user_id' => $this->user->id,
        'campaign_id' => $this->campaign->id,
        'activity_type' => 'prospects_discovered',
    ]);
});
