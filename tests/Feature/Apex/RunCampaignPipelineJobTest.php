<?php

use App\Jobs\Apex\RunCampaignPipelineJob;
use App\Models\ApexCampaign;
use App\Models\ApexCampaignProspect;
use App\Models\ApexLinkedInAccount;
use App\Models\ApexProspect;
use App\Models\ApexUserSettings;
use App\Models\PortalAvailableAgent;
use App\Models\User;
use App\Services\Apex\UnipileService;
use App\Services\EventEmailService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->mock(EventEmailService::class)->shouldIgnoreMissing();

    $this->user = User::factory()->create();
    $this->agent = PortalAvailableAgent::factory()->create(['name' => 'Apex']);
    $this->linkedInAccount = ApexLinkedInAccount::factory()->create([
        'user_id' => $this->user->id,
        'status' => 'active',
        'unipile_account_id' => 'unipile_123',
    ]);
    $this->settings = ApexUserSettings::factory()->create([
        'user_id' => $this->user->id,
        'autopilot_enabled' => false,
    ]);
});

// ─── Early Return Tests ────────────────────────────────────────────

it('skips inactive campaigns', function () {
    $campaign = ApexCampaign::factory()->paused()->create([
        'user_id' => $this->user->id,
    ]);

    $unipileService = $this->mock(UnipileService::class);
    $unipileService->shouldNotReceive('searchProfiles');

    RunCampaignPipelineJob::dispatch($campaign, $this->agent);
    RunCampaignPipelineJob::dispatchSync($campaign, $this->agent);
});

it('skips when no active linkedin account exists', function () {
    $campaign = ApexCampaign::factory()->active()->create([
        'user_id' => $this->user->id,
    ]);

    $this->linkedInAccount->update(['status' => 'disconnected']);

    $unipileService = $this->mock(UnipileService::class);
    $unipileService->shouldReceive('forAgent')->andReturnSelf();
    $unipileService->shouldNotReceive('searchProfiles');

    RunCampaignPipelineJob::dispatchSync($campaign, $this->agent);
});

it('skips when unipile service is not configured', function () {
    $campaign = ApexCampaign::factory()->active()->create([
        'user_id' => $this->user->id,
    ]);

    $unipileService = $this->mock(UnipileService::class);
    $unipileService->shouldReceive('forAgent')->andReturnSelf();
    $unipileService->shouldReceive('isConfigured')->andReturn(false);
    $unipileService->shouldNotReceive('searchProfiles');

    RunCampaignPipelineJob::dispatchSync($campaign, $this->agent);
});

// ─── Discovery Tests ───────────────────────────────────────────────

it('discovers and creates new prospects from linkedin search', function () {
    $campaign = ApexCampaign::factory()->active()->create([
        'user_id' => $this->user->id,
        'job_titles' => ['Software Engineer'],
        'locations' => ['San Francisco'],
        'keywords' => ['startup'],
        'industries' => ['Technology'],
        'daily_connection_limit' => 25,
    ]);

    $searchResults = collect([
        [
            'provider_id' => 'linkedin_123',
            'public_profile_url' => 'https://linkedin.com/in/johndoe',
            'first_name' => 'John',
            'last_name' => 'Doe',
            'headline' => 'Software Engineer at Acme',
            'company' => 'Acme Corp',
            'job_title' => 'Senior Engineer',
            'location' => 'San Francisco, CA',
            'profile_picture_url' => 'https://example.com/avatar.jpg',
        ],
    ]);

    $unipileService = $this->mock(UnipileService::class);
    $unipileService->shouldReceive('forAgent')->andReturnSelf();
    $unipileService->shouldReceive('isConfigured')->andReturn(true);
    $unipileService->shouldReceive('getChats')->andReturn(collect([]));
    $unipileService->shouldReceive('getChatMessages')->andReturn(collect([]));
    $unipileService->shouldReceive('searchProfiles')
        ->with('unipile_123', \Mockery::type('array'), 25)
        ->once()
        ->andReturn($searchResults);

    RunCampaignPipelineJob::dispatchSync($campaign, $this->agent);

    $this->assertDatabaseHas('apex_prospects', [
        'user_id' => $this->user->id,
        'linkedin_profile_id' => 'linkedin_123',
        'first_name' => 'John',
        'last_name' => 'Doe',
        'company' => 'Acme Corp',
    ]);

    $this->assertDatabaseHas('apex_campaign_prospects', [
        'campaign_id' => $campaign->id,
        'status' => 'queued',
    ]);
});

it('skips discovery when campaign has no targeting criteria', function () {
    $campaign = ApexCampaign::factory()->active()->create([
        'user_id' => $this->user->id,
        'job_titles' => null,
        'locations' => null,
        'keywords' => null,
        'industries' => null,
    ]);

    $unipileService = $this->mock(UnipileService::class);
    $unipileService->shouldReceive('forAgent')->andReturnSelf();
    $unipileService->shouldReceive('isConfigured')->andReturn(true);
    $unipileService->shouldReceive('getChats')->andReturn(collect([]));
    $unipileService->shouldReceive('getChatMessages')->andReturn(collect([]));
    $unipileService->shouldNotReceive('searchProfiles');

    RunCampaignPipelineJob::dispatchSync($campaign, $this->agent);
});

it('filters out meaningless targeting values', function () {
    $campaign = ApexCampaign::factory()->active()->create([
        'user_id' => $this->user->id,
        'job_titles' => ['open', 'any', 'Software Engineer'],
        'locations' => ['global', 'anywhere', 'San Francisco'],
        'keywords' => ['n/a', 'startup'],
        'industries' => ['skip', 'Technology'],
    ]);

    $unipileService = $this->mock(UnipileService::class);
    $unipileService->shouldReceive('forAgent')->andReturnSelf();
    $unipileService->shouldReceive('isConfigured')->andReturn(true);
    $unipileService->shouldReceive('getChats')->andReturn(collect([]));
    $unipileService->shouldReceive('getChatMessages')->andReturn(collect([]));
    $unipileService->shouldReceive('searchProfiles')
        ->with('unipile_123', \Mockery::on(function ($filters) {
            $keywords = $filters['keywords'] ?? '';

            return str_contains($keywords, 'Software Engineer')
                && str_contains($keywords, 'San Francisco')
                && str_contains($keywords, 'startup')
                && str_contains($keywords, 'Technology')
                && ! str_contains($keywords, 'open')
                && ! str_contains($keywords, 'global')
                && ! str_contains($keywords, 'n/a')
                && ! str_contains($keywords, 'skip');
        }), 25)
        ->andReturn(collect([]));

    RunCampaignPipelineJob::dispatchSync($campaign, $this->agent);

    expect(true)->toBeTrue(); // Assert that mock expectations were met
});

it('does not create duplicate campaign prospects', function () {
    $campaign = ApexCampaign::factory()->active()->create([
        'user_id' => $this->user->id,
        'job_titles' => ['Engineer'],
    ]);

    $prospect = ApexProspect::factory()->create([
        'user_id' => $this->user->id,
        'linkedin_profile_id' => 'linkedin_123',
    ]);

    ApexCampaignProspect::factory()->create([
        'campaign_id' => $campaign->id,
        'prospect_id' => $prospect->id,
        'status' => 'queued',
    ]);

    $searchResults = collect([
        [
            'provider_id' => 'linkedin_123',
            'public_profile_url' => 'https://linkedin.com/in/johndoe',
            'name' => 'John Doe',
        ],
    ]);

    $unipileService = $this->mock(UnipileService::class);
    $unipileService->shouldReceive('forAgent')->andReturnSelf();
    $unipileService->shouldReceive('isConfigured')->andReturn(true);
    $unipileService->shouldReceive('getChats')->andReturn(collect([]));
    $unipileService->shouldReceive('getChatMessages')->andReturn(collect([]));
    $unipileService->shouldReceive('searchProfiles')->andReturn($searchResults);

    RunCampaignPipelineJob::dispatchSync($campaign, $this->agent);

    expect(ApexCampaignProspect::where('campaign_id', $campaign->id)->count())->toBe(1);
});

it('logs activity when prospects are discovered', function () {
    $campaign = ApexCampaign::factory()->active()->create([
        'user_id' => $this->user->id,
        'job_titles' => ['Engineer'],
    ]);

    $searchResults = collect([
        ['provider_id' => 'linkedin_123', 'name' => 'John Doe'],
    ]);

    $unipileService = $this->mock(UnipileService::class);
    $unipileService->shouldReceive('forAgent')->andReturnSelf();
    $unipileService->shouldReceive('isConfigured')->andReturn(true);
    $unipileService->shouldReceive('getChats')->andReturn(collect([]));
    $unipileService->shouldReceive('getChatMessages')->andReturn(collect([]));
    $unipileService->shouldReceive('searchProfiles')->andReturn($searchResults);

    RunCampaignPipelineJob::dispatchSync($campaign, $this->agent);

    $this->assertDatabaseHas('apex_activity_log', [
        'user_id' => $this->user->id,
        'activity_type' => 'prospects_discovered',
        'campaign_id' => $campaign->id,
    ]);
});

// ─── Connection Request Tests ──────────────────────────────────────

it('sends connection requests when autopilot is enabled', function () {
    $this->settings->update(['autopilot_enabled' => true]);

    $campaign = ApexCampaign::factory()->active()->create([
        'user_id' => $this->user->id,
        'connection_message' => 'Hi, let\'s connect!',
        'daily_connection_limit' => 5,
    ]);

    $prospect = ApexProspect::factory()->create([
        'user_id' => $this->user->id,
        'linkedin_profile_id' => 'linkedin_123',
    ]);

    ApexCampaignProspect::factory()->create([
        'campaign_id' => $campaign->id,
        'prospect_id' => $prospect->id,
        'status' => 'queued',
    ]);

    $unipileService = $this->mock(UnipileService::class);
    $unipileService->shouldReceive('forAgent')->andReturnSelf();
    $unipileService->shouldReceive('isConfigured')->andReturn(true);
    $unipileService->shouldReceive('getChats')->andReturn(collect([]));
    $unipileService->shouldReceive('getChatMessages')->andReturn(collect([]));
    $unipileService->shouldReceive('searchProfiles')->andReturn(collect([]));
    $unipileService->shouldReceive('sendConnectionRequest')
        ->with('unipile_123', 'linkedin_123', 'Hi, let\'s connect!')
        ->once()
        ->andReturn(true);

    RunCampaignPipelineJob::dispatchSync($campaign, $this->agent);

    $this->assertDatabaseHas('apex_campaign_prospects', [
        'campaign_id' => $campaign->id,
        'prospect_id' => $prospect->id,
        'status' => 'connection_sent',
    ]);

    $this->assertDatabaseHas('apex_prospects', [
        'id' => $prospect->id,
        'connection_status' => 'pending',
    ]);

    expect($campaign->fresh()->connections_sent)->toBe(1);
});

it('creates pending actions when autopilot is disabled', function () {
    $this->settings->update(['autopilot_enabled' => false]);

    $campaign = ApexCampaign::factory()->active()->create([
        'user_id' => $this->user->id,
        'connection_message' => 'Hi, let\'s connect!',
    ]);

    $prospect = ApexProspect::factory()->create([
        'user_id' => $this->user->id,
        'linkedin_profile_id' => 'linkedin_123',
        'first_name' => 'John',
        'last_name' => 'Doe',
    ]);

    ApexCampaignProspect::factory()->create([
        'campaign_id' => $campaign->id,
        'prospect_id' => $prospect->id,
        'status' => 'queued',
    ]);

    $unipileService = $this->mock(UnipileService::class);
    $unipileService->shouldReceive('forAgent')->andReturnSelf();
    $unipileService->shouldReceive('isConfigured')->andReturn(true);
    $unipileService->shouldReceive('getChats')->andReturn(collect([]));
    $unipileService->shouldReceive('getChatMessages')->andReturn(collect([]));
    $unipileService->shouldReceive('searchProfiles')->andReturn(collect([]));
    $unipileService->shouldNotReceive('sendConnectionRequest');

    RunCampaignPipelineJob::dispatchSync($campaign, $this->agent);

    $this->assertDatabaseHas('apex_pending_actions', [
        'user_id' => $this->user->id,
        'campaign_id' => $campaign->id,
        'prospect_id' => $prospect->id,
        'action_type' => 'send_connection',
        'status' => 'pending',
        'message_content' => 'Hi, let\'s connect!',
    ]);
});

it('respects daily connection limit', function () {
    $this->settings->update(['autopilot_enabled' => true]);

    $campaign = ApexCampaign::factory()->active()->create([
        'user_id' => $this->user->id,
        'daily_connection_limit' => 2,
    ]);

    $prospects = ApexProspect::factory()->count(5)->create([
        'user_id' => $this->user->id,
    ]);

    foreach ($prospects as $prospect) {
        ApexCampaignProspect::factory()->create([
            'campaign_id' => $campaign->id,
            'prospect_id' => $prospect->id,
            'status' => 'queued',
        ]);
    }

    $unipileService = $this->mock(UnipileService::class);
    $unipileService->shouldReceive('forAgent')->andReturnSelf();
    $unipileService->shouldReceive('isConfigured')->andReturn(true);
    $unipileService->shouldReceive('getChats')->andReturn(collect([]));
    $unipileService->shouldReceive('getChatMessages')->andReturn(collect([]));
    $unipileService->shouldReceive('searchProfiles')->andReturn(collect([]));
    $unipileService->shouldReceive('sendConnectionRequest')
        ->times(2)
        ->andReturn(true);

    RunCampaignPipelineJob::dispatchSync($campaign, $this->agent);

    expect(ApexCampaignProspect::where('status', 'connection_sent')->count())->toBe(2);
    expect(ApexCampaignProspect::where('status', 'queued')->count())->toBe(3);
});

it('marks prospect as failed when connection request fails', function () {
    $this->settings->update(['autopilot_enabled' => true]);

    $campaign = ApexCampaign::factory()->active()->create([
        'user_id' => $this->user->id,
    ]);

    $prospect = ApexProspect::factory()->create([
        'user_id' => $this->user->id,
        'linkedin_profile_id' => 'linkedin_123',
    ]);

    ApexCampaignProspect::factory()->create([
        'campaign_id' => $campaign->id,
        'prospect_id' => $prospect->id,
        'status' => 'queued',
    ]);

    $unipileService = $this->mock(UnipileService::class);
    $unipileService->shouldReceive('forAgent')->andReturnSelf();
    $unipileService->shouldReceive('isConfigured')->andReturn(true);
    $unipileService->shouldReceive('getChats')->andReturn(collect([]));
    $unipileService->shouldReceive('getChatMessages')->andReturn(collect([]));
    $unipileService->shouldReceive('searchProfiles')->andReturn(collect([]));
    $unipileService->shouldReceive('sendConnectionRequest')->andReturn(false);

    RunCampaignPipelineJob::dispatchSync($campaign, $this->agent);

    $this->assertDatabaseHas('apex_campaign_prospects', [
        'campaign_id' => $campaign->id,
        'prospect_id' => $prospect->id,
        'status' => 'failed',
    ]);
});

it('marks prospect as failed when no linkedin profile id exists', function () {
    $this->settings->update(['autopilot_enabled' => true]);

    $campaign = ApexCampaign::factory()->active()->create([
        'user_id' => $this->user->id,
    ]);

    $prospect = ApexProspect::factory()->create([
        'user_id' => $this->user->id,
        'linkedin_profile_id' => null,
    ]);

    ApexCampaignProspect::factory()->create([
        'campaign_id' => $campaign->id,
        'prospect_id' => $prospect->id,
        'status' => 'queued',
    ]);

    $unipileService = $this->mock(UnipileService::class);
    $unipileService->shouldReceive('forAgent')->andReturnSelf();
    $unipileService->shouldReceive('isConfigured')->andReturn(true);
    $unipileService->shouldReceive('getChats')->andReturn(collect([]));
    $unipileService->shouldReceive('getChatMessages')->andReturn(collect([]));
    $unipileService->shouldReceive('searchProfiles')->andReturn(collect([]));
    $unipileService->shouldNotReceive('sendConnectionRequest');

    RunCampaignPipelineJob::dispatchSync($campaign, $this->agent);

    $this->assertDatabaseHas('apex_campaign_prospects', [
        'campaign_id' => $campaign->id,
        'prospect_id' => $prospect->id,
        'status' => 'failed',
    ]);
});

it('logs activity when connection is sent', function () {
    $this->settings->update(['autopilot_enabled' => true]);

    $campaign = ApexCampaign::factory()->active()->create([
        'user_id' => $this->user->id,
    ]);

    $prospect = ApexProspect::factory()->create([
        'user_id' => $this->user->id,
        'first_name' => 'John',
        'last_name' => 'Doe',
    ]);

    ApexCampaignProspect::factory()->create([
        'campaign_id' => $campaign->id,
        'prospect_id' => $prospect->id,
        'status' => 'queued',
    ]);

    $unipileService = $this->mock(UnipileService::class);
    $unipileService->shouldReceive('forAgent')->andReturnSelf();
    $unipileService->shouldReceive('isConfigured')->andReturn(true);
    $unipileService->shouldReceive('getChats')->andReturn(collect([]));
    $unipileService->shouldReceive('getChatMessages')->andReturn(collect([]));
    $unipileService->shouldReceive('searchProfiles')->andReturn(collect([]));
    $unipileService->shouldReceive('sendConnectionRequest')->andReturn(true);

    RunCampaignPipelineJob::dispatchSync($campaign, $this->agent);

    $this->assertDatabaseHas('apex_activity_log', [
        'user_id' => $this->user->id,
        'activity_type' => 'connection_sent',
        'campaign_id' => $campaign->id,
        'prospect_id' => $prospect->id,
    ]);
});

// ─── Follow-Up Tests ───────────────────────────────────────────────

it('sends follow-up messages when autopilot is enabled', function () {
    $this->settings->update(['autopilot_enabled' => true]);

    $campaign = ApexCampaign::factory()->active()->create([
        'user_id' => $this->user->id,
        'follow_up_message_1' => 'First follow-up',
        'follow_up_delay_days_2' => 3,
    ]);

    $prospect = ApexProspect::factory()->create([
        'user_id' => $this->user->id,
        'linkedin_profile_id' => 'linkedin_123',
    ]);

    ApexCampaignProspect::factory()->create([
        'campaign_id' => $campaign->id,
        'prospect_id' => $prospect->id,
        'status' => 'connection_accepted',
        'follow_up_count' => 0,
        'next_follow_up_at' => now()->subDay(),
    ]);

    $unipileService = $this->mock(UnipileService::class);
    $unipileService->shouldReceive('forAgent')->andReturnSelf();
    $unipileService->shouldReceive('isConfigured')->andReturn(true);
    $unipileService->shouldReceive('getChatMessages')->andReturn(collect([]));
    $unipileService->shouldReceive('searchProfiles')->andReturn(collect([]));
    // First call to getChats (sync) returns empty, second call (follow-up) returns the chat
    $unipileService->shouldReceive('getChats')
        ->twice()
        ->andReturn(
            collect([]),  // First call (sync)
            collect([     // Second call (follow-up)
                [
                    'id' => 'chat_123',
                    'attendees' => [
                        ['provider_id' => 'linkedin_123'],
                    ],
                ],
            ])
        );
    $unipileService->shouldReceive('sendMessage')
        ->with('chat_123', 'First follow-up')
        ->once()
        ->andReturn(true);

    RunCampaignPipelineJob::dispatchSync($campaign, $this->agent);

    $this->assertDatabaseHas('apex_campaign_prospects', [
        'campaign_id' => $campaign->id,
        'prospect_id' => $prospect->id,
        'status' => 'message_sent',
        'follow_up_count' => 1,
    ]);

    expect($campaign->fresh()->messages_sent)->toBe(1);
});

it('creates chat when none exists for follow-up', function () {
    $this->settings->update(['autopilot_enabled' => true]);

    $campaign = ApexCampaign::factory()->active()->create([
        'user_id' => $this->user->id,
        'follow_up_message_1' => 'First follow-up',
    ]);

    $prospect = ApexProspect::factory()->create([
        'user_id' => $this->user->id,
        'linkedin_profile_id' => 'linkedin_123',
    ]);

    ApexCampaignProspect::factory()->create([
        'campaign_id' => $campaign->id,
        'prospect_id' => $prospect->id,
        'status' => 'connection_accepted',
        'follow_up_count' => 0,
        'next_follow_up_at' => now()->subDay(),
    ]);

    $unipileService = $this->mock(UnipileService::class);
    $unipileService->shouldReceive('forAgent')->andReturnSelf();
    $unipileService->shouldReceive('isConfigured')->andReturn(true);
    $unipileService->shouldReceive('getChats')->andReturn(collect([]));
    $unipileService->shouldReceive('getChatMessages')->andReturn(collect([]));
    $unipileService->shouldReceive('searchProfiles')->andReturn(collect([]));
    $unipileService->shouldReceive('getChats')->andReturn(collect([]));
    $unipileService->shouldReceive('startChat')
        ->with('unipile_123', 'linkedin_123', 'First follow-up')
        ->once()
        ->andReturn('new_chat_123');
    $unipileService->shouldReceive('sendMessage')
        ->with('new_chat_123', 'First follow-up')
        ->once()
        ->andReturn(true);

    RunCampaignPipelineJob::dispatchSync($campaign, $this->agent);

    $this->assertDatabaseHas('apex_campaign_prospects', [
        'status' => 'message_sent',
        'follow_up_count' => 1,
    ]);
});

it('creates pending action for follow-up when autopilot is disabled', function () {
    $this->settings->update(['autopilot_enabled' => false]);

    $campaign = ApexCampaign::factory()->active()->create([
        'user_id' => $this->user->id,
        'follow_up_message_1' => 'First follow-up',
    ]);

    $prospect = ApexProspect::factory()->create([
        'user_id' => $this->user->id,
        'first_name' => 'John',
        'last_name' => 'Doe',
    ]);

    ApexCampaignProspect::factory()->create([
        'campaign_id' => $campaign->id,
        'prospect_id' => $prospect->id,
        'status' => 'connection_accepted',
        'follow_up_count' => 0,
        'next_follow_up_at' => now()->subDay(),
    ]);

    $unipileService = $this->mock(UnipileService::class);
    $unipileService->shouldReceive('forAgent')->andReturnSelf();
    $unipileService->shouldReceive('isConfigured')->andReturn(true);
    $unipileService->shouldReceive('getChats')->andReturn(collect([]));
    $unipileService->shouldReceive('getChatMessages')->andReturn(collect([]));
    $unipileService->shouldReceive('searchProfiles')->andReturn(collect([]));
    $unipileService->shouldNotReceive('getChats');
    $unipileService->shouldNotReceive('sendMessage');

    RunCampaignPipelineJob::dispatchSync($campaign, $this->agent);

    $this->assertDatabaseHas('apex_pending_actions', [
        'user_id' => $this->user->id,
        'campaign_id' => $campaign->id,
        'prospect_id' => $prospect->id,
        'action_type' => 'send_follow_up',
        'status' => 'pending',
        'message_content' => 'First follow-up',
    ]);
});

it('respects daily message limit for follow-ups', function () {
    $this->settings->update(['autopilot_enabled' => true]);

    $campaign = ApexCampaign::factory()->active()->create([
        'user_id' => $this->user->id,
        'follow_up_message_1' => 'First follow-up',
        'daily_message_limit' => 2,
    ]);

    $prospects = ApexProspect::factory()->count(5)->create([
        'user_id' => $this->user->id,
    ]);

    foreach ($prospects as $prospect) {
        ApexCampaignProspect::factory()->create([
            'campaign_id' => $campaign->id,
            'prospect_id' => $prospect->id,
            'status' => 'connection_accepted',
            'follow_up_count' => 0,
            'next_follow_up_at' => now()->subDay(),
        ]);
    }

    $unipileService = $this->mock(UnipileService::class);
    $unipileService->shouldReceive('forAgent')->andReturnSelf();
    $unipileService->shouldReceive('isConfigured')->andReturn(true);
    $unipileService->shouldReceive('getChatMessages')->andReturn(collect([]));
    $unipileService->shouldReceive('searchProfiles')->andReturn(collect([]));
    // Sync call + 2 follow-up calls (since limit is 2)
    $unipileService->shouldReceive('getChats')->times(3)->andReturn(collect([]));
    $unipileService->shouldReceive('startChat')->times(2)->andReturn('chat_123');
    $unipileService->shouldReceive('sendMessage')->times(2)->andReturn(true);

    RunCampaignPipelineJob::dispatchSync($campaign, $this->agent);

    expect(ApexCampaignProspect::where('status', 'message_sent')->count())->toBe(2);
});

it('sends multiple follow-ups in sequence', function () {
    $this->settings->update(['autopilot_enabled' => true]);

    $campaign = ApexCampaign::factory()->active()->create([
        'user_id' => $this->user->id,
        'follow_up_message_1' => 'First follow-up',
        'follow_up_message_2' => 'Second follow-up',
        'follow_up_message_3' => 'Third follow-up',
        'follow_up_delay_days_2' => 3,
        'follow_up_delay_days_3' => 5,
    ]);

    $prospect = ApexProspect::factory()->create([
        'user_id' => $this->user->id,
        'linkedin_profile_id' => 'linkedin_123',
    ]);

    $campaignProspect = ApexCampaignProspect::factory()->create([
        'campaign_id' => $campaign->id,
        'prospect_id' => $prospect->id,
        'status' => 'message_sent',
        'follow_up_count' => 1,
        'next_follow_up_at' => now()->subDay(),
    ]);

    $unipileService = $this->mock(UnipileService::class);
    $unipileService->shouldReceive('forAgent')->andReturnSelf();
    $unipileService->shouldReceive('isConfigured')->andReturn(true);
    $unipileService->shouldReceive('getChatMessages')->andReturn(collect([]));
    $unipileService->shouldReceive('searchProfiles')->andReturn(collect([]));
    // First call (sync) returns empty, second call (follow-up) returns the chat
    $unipileService->shouldReceive('getChats')
        ->twice()
        ->andReturn(
            collect([]),  // First call (sync)
            collect([     // Second call (follow-up)
                ['id' => 'chat_123', 'attendees' => [['provider_id' => 'linkedin_123']]],
            ])
        );
    $unipileService->shouldReceive('sendMessage')
        ->with('chat_123', 'Second follow-up')
        ->once()
        ->andReturn(true);

    RunCampaignPipelineJob::dispatchSync($campaign, $this->agent);

    $updated = $campaignProspect->fresh();
    expect($updated->follow_up_count)->toBe(2);
    expect($updated->next_follow_up_at)->not->toBeNull();
});

it('stops follow-ups after all messages are sent', function () {
    $this->settings->update(['autopilot_enabled' => true]);

    $campaign = ApexCampaign::factory()->active()->create([
        'user_id' => $this->user->id,
        'follow_up_message_1' => 'First follow-up',
        'follow_up_message_2' => 'Second follow-up',
        'follow_up_message_3' => 'Third follow-up',
    ]);

    $prospect = ApexProspect::factory()->create([
        'user_id' => $this->user->id,
        'linkedin_profile_id' => 'linkedin_123',
    ]);

    $campaignProspect = ApexCampaignProspect::factory()->create([
        'campaign_id' => $campaign->id,
        'prospect_id' => $prospect->id,
        'status' => 'message_sent',
        'follow_up_count' => 3,
        'next_follow_up_at' => now()->subDay(),
    ]);

    $unipileService = $this->mock(UnipileService::class);
    $unipileService->shouldReceive('forAgent')->andReturnSelf();
    $unipileService->shouldReceive('isConfigured')->andReturn(true);
    $unipileService->shouldReceive('getChats')->andReturn(collect([]));
    $unipileService->shouldReceive('getChatMessages')->andReturn(collect([]));
    $unipileService->shouldReceive('searchProfiles')->andReturn(collect([]));
    $unipileService->shouldNotReceive('getChats');
    $unipileService->shouldNotReceive('sendMessage');

    RunCampaignPipelineJob::dispatchSync($campaign, $this->agent);

    $updated = $campaignProspect->fresh();
    expect($updated->follow_up_count)->toBe(3);
    expect($updated->next_follow_up_at)->toBeNull();
});

it('logs activity when follow-up is sent', function () {
    $this->settings->update(['autopilot_enabled' => true]);

    $campaign = ApexCampaign::factory()->active()->create([
        'user_id' => $this->user->id,
        'follow_up_message_1' => 'First follow-up',
    ]);

    $prospect = ApexProspect::factory()->create([
        'user_id' => $this->user->id,
        'linkedin_profile_id' => 'linkedin_123',
        'first_name' => 'John',
        'last_name' => 'Doe',
    ]);

    ApexCampaignProspect::factory()->create([
        'campaign_id' => $campaign->id,
        'prospect_id' => $prospect->id,
        'status' => 'connection_accepted',
        'follow_up_count' => 0,
        'next_follow_up_at' => now()->subDay(),
    ]);

    $unipileService = $this->mock(UnipileService::class);
    $unipileService->shouldReceive('forAgent')->andReturnSelf();
    $unipileService->shouldReceive('isConfigured')->andReturn(true);
    $unipileService->shouldReceive('getChatMessages')->andReturn(collect([]));
    $unipileService->shouldReceive('searchProfiles')->andReturn(collect([]));
    // First call (sync) returns empty, second call (follow-up) returns the chat
    $unipileService->shouldReceive('getChats')
        ->twice()
        ->andReturn(
            collect([]),  // First call (sync)
            collect([     // Second call (follow-up)
                ['id' => 'chat_123', 'attendees' => [['provider_id' => 'linkedin_123']]],
            ])
        );
    $unipileService->shouldReceive('sendMessage')->andReturn(true);

    RunCampaignPipelineJob::dispatchSync($campaign, $this->agent);

    $this->assertDatabaseHas('apex_activity_log', [
        'user_id' => $this->user->id,
        'activity_type' => 'follow_up_sent',
        'campaign_id' => $campaign->id,
        'prospect_id' => $prospect->id,
    ]);
});

// ─── Integration Tests ─────────────────────────────────────────────

it('completes full pipeline: discover, connect, and follow-up', function () {
    $this->settings->update(['autopilot_enabled' => true]);

    $campaign = ApexCampaign::factory()->active()->create([
        'user_id' => $this->user->id,
        'job_titles' => ['Engineer'],
        'connection_message' => 'Hi!',
        'follow_up_message_1' => 'Follow-up',
        'daily_connection_limit' => 5,
        'daily_message_limit' => 5,
    ]);

    $searchResults = collect([
        ['provider_id' => 'new_linkedin_123', 'name' => 'Jane Doe'],
    ]);

    $existingProspect = ApexProspect::factory()->create([
        'user_id' => $this->user->id,
        'linkedin_profile_id' => 'existing_123',
    ]);

    ApexCampaignProspect::factory()->create([
        'campaign_id' => $campaign->id,
        'prospect_id' => $existingProspect->id,
        'status' => 'queued',
    ]);

    $unipileService = $this->mock(UnipileService::class);
    $unipileService->shouldReceive('forAgent')->andReturnSelf();
    $unipileService->shouldReceive('isConfigured')->andReturn(true);
    $unipileService->shouldReceive('getChats')->andReturn(collect([]));
    $unipileService->shouldReceive('getChatMessages')->andReturn(collect([]));
    $unipileService->shouldReceive('searchProfiles')->andReturn($searchResults);
    $unipileService->shouldReceive('sendConnectionRequest')->twice()->andReturn(true);

    RunCampaignPipelineJob::dispatchSync($campaign, $this->agent);

    expect(ApexProspect::count())->toBe(2);
    expect(ApexCampaignProspect::where('status', 'connection_sent')->count())->toBe(2);
});
