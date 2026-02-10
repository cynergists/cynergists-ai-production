<?php

use App\Models\ApexActivityLog;
use App\Models\ApexCampaign;
use App\Models\ApexProspect;
use App\Models\User;
use App\Services\EventEmailService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->mock(EventEmailService::class)->shouldIgnoreMissing();
});

it('returns paginated activity logs for authenticated user', function () {
    ApexActivityLog::factory()->count(3)->create(['user_id' => $this->user->id]);

    $response = $this->actingAs($this->user)
        ->getJson('/api/apex/activity-logs');

    $response->assertSuccessful()
        ->assertJsonCount(3, 'data')
        ->assertJsonStructure([
            'data' => [['id', 'activity_type', 'description', 'created_at']],
            'current_page',
            'last_page',
            'per_page',
            'total',
        ]);
});

it('filters activity logs by activity_type', function () {
    ApexActivityLog::factory()->connectionSent()->count(2)->create(['user_id' => $this->user->id]);
    ApexActivityLog::factory()->messageSent()->create(['user_id' => $this->user->id]);

    $response = $this->actingAs($this->user)
        ->getJson('/api/apex/activity-logs?activity_type=connection_sent');

    $response->assertSuccessful()
        ->assertJsonCount(2, 'data');
});

it('filters activity logs by campaign_id', function () {
    $campaign = ApexCampaign::factory()->create(['user_id' => $this->user->id]);
    $otherCampaign = ApexCampaign::factory()->create(['user_id' => $this->user->id]);

    ApexActivityLog::factory()->count(3)->create([
        'user_id' => $this->user->id,
        'campaign_id' => $campaign->id,
    ]);
    ApexActivityLog::factory()->count(2)->create([
        'user_id' => $this->user->id,
        'campaign_id' => $otherCampaign->id,
    ]);

    $response = $this->actingAs($this->user)
        ->getJson("/api/apex/activity-logs?campaign_id={$campaign->id}");

    $response->assertSuccessful()
        ->assertJsonCount(3, 'data');
});

it('does not return other users activity logs', function () {
    $otherUser = User::factory()->create();
    ApexActivityLog::factory()->count(3)->create(['user_id' => $otherUser->id]);
    ApexActivityLog::factory()->create(['user_id' => $this->user->id]);

    $response = $this->actingAs($this->user)
        ->getJson('/api/apex/activity-logs');

    $response->assertSuccessful()
        ->assertJsonCount(1, 'data');
});

it('returns 401 for unauthenticated requests', function () {
    $response = $this->getJson('/api/apex/activity-logs');

    $response->assertUnauthorized();
});

it('eager loads campaign and prospect relationships', function () {
    $campaign = ApexCampaign::factory()->create(['user_id' => $this->user->id]);
    $prospect = ApexProspect::factory()->create(['user_id' => $this->user->id]);

    ApexActivityLog::factory()->create([
        'user_id' => $this->user->id,
        'campaign_id' => $campaign->id,
        'prospect_id' => $prospect->id,
    ]);

    $response = $this->actingAs($this->user)
        ->getJson('/api/apex/activity-logs');

    $response->assertSuccessful()
        ->assertJsonPath('data.0.campaign.id', $campaign->id)
        ->assertJsonPath('data.0.campaign.name', $campaign->name)
        ->assertJsonPath('data.0.prospect.id', $prospect->id);
});

it('returns logs in reverse chronological order', function () {
    $oldLog = ApexActivityLog::factory()->create([
        'user_id' => $this->user->id,
        'created_at' => now()->subDay(),
        'description' => 'old',
    ]);
    $newLog = ApexActivityLog::factory()->create([
        'user_id' => $this->user->id,
        'created_at' => now(),
        'description' => 'new',
    ]);

    $response = $this->actingAs($this->user)
        ->getJson('/api/apex/activity-logs');

    $response->assertSuccessful()
        ->assertJsonPath('data.0.id', $newLog->id)
        ->assertJsonPath('data.1.id', $oldLog->id);
});
