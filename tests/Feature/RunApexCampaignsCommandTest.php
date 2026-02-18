<?php

use App\Jobs\Apex\RunCampaignPipelineJob;
use App\Models\ApexCampaign;
use App\Models\ApexPendingAction;
use App\Models\PortalAvailableAgent;
use App\Models\User;
use App\Services\EventEmailService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->mock(EventEmailService::class)->shouldIgnoreMissing();
    Bus::fake();
});

it('dispatches jobs for each active campaign', function () {
    $agent = PortalAvailableAgent::factory()->create(['name' => 'Apex']);
    $user = User::factory()->create();
    $campaign = ApexCampaign::factory()->active()->create(['user_id' => $user->id]);

    $this->artisan('apex:run-campaigns')
        ->assertSuccessful();

    Bus::assertDispatched(RunCampaignPipelineJob::class);
});

it('skips inactive campaigns', function () {
    $agent = PortalAvailableAgent::factory()->create(['name' => 'Apex']);
    $user = User::factory()->create();

    ApexCampaign::factory()->paused()->create(['user_id' => $user->id]);
    ApexCampaign::factory()->completed()->create(['user_id' => $user->id]);
    ApexCampaign::factory()->create(['user_id' => $user->id, 'status' => 'draft']);

    $this->artisan('apex:run-campaigns')
        ->assertSuccessful();

    Bus::assertNotDispatched(RunCampaignPipelineJob::class);
});

it('fails when apex agent not found', function () {
    $this->artisan('apex:run-campaigns')
        ->assertFailed();
});

it('dispatches jobs for multiple active campaigns', function () {
    $agent = PortalAvailableAgent::factory()->create(['name' => 'Apex']);
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();

    ApexCampaign::factory()->active()->create(['user_id' => $user1->id]);
    ApexCampaign::factory()->active()->create(['user_id' => $user2->id]);

    $this->artisan('apex:run-campaigns')
        ->assertSuccessful();

    Bus::assertDispatchedTimes(RunCampaignPipelineJob::class, 2);
});

it('expires stale pending actions', function () {
    $agent = PortalAvailableAgent::factory()->create(['name' => 'Apex']);
    $user = User::factory()->create();

    ApexPendingAction::factory()->create([
        'user_id' => $user->id,
        'status' => 'pending',
        'expires_at' => now()->subDay(),
    ]);

    $this->artisan('apex:run-campaigns')
        ->assertSuccessful();

    $this->assertDatabaseHas('apex_pending_actions', [
        'user_id' => $user->id,
        'status' => 'expired',
    ]);
});

it('dispatches jobs with delays', function () {
    $agent = PortalAvailableAgent::factory()->create(['name' => 'Apex']);
    $user = User::factory()->create();
    ApexCampaign::factory()->active()->create(['user_id' => $user->id]);

    $this->artisan('apex:run-campaigns')
        ->assertSuccessful();

    Bus::assertDispatched(RunCampaignPipelineJob::class, function ($job) {
        return $job->delay !== null;
    });
});
