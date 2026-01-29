<?php

use App\Models\ApexCampaign;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    Sanctum::actingAs($this->user);
});

describe('Campaign API', function () {
    it('lists user campaigns', function () {
        ApexCampaign::factory()->count(3)->create(['user_id' => $this->user->id]);
        ApexCampaign::factory()->count(2)->create(); // Other user's campaigns

        $response = $this->getJson('/api/apex/campaigns');

        $response->assertOk()
            ->assertJsonCount(3, 'campaigns');
    });

    it('creates a campaign', function () {
        $response = $this->postJson('/api/apex/campaigns', [
            'name' => 'Test Campaign',
            'campaign_type' => 'connection',
            'job_titles' => ['CEO', 'CTO'],
            'locations' => ['Denver, CO'],
            'connection_message' => 'Hi, I would like to connect!',
        ]);

        $response->assertCreated()
            ->assertJsonPath('campaign.name', 'Test Campaign')
            ->assertJsonPath('campaign.status', 'draft');

        $this->assertDatabaseHas('apex_campaigns', [
            'user_id' => $this->user->id,
            'name' => 'Test Campaign',
        ]);
    });

    it('validates campaign creation', function () {
        $response = $this->postJson('/api/apex/campaigns', [
            'name' => '',
            'campaign_type' => 'invalid',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'campaign_type']);
    });

    it('shows a single campaign', function () {
        $campaign = ApexCampaign::factory()->create(['user_id' => $this->user->id]);

        $response = $this->getJson("/api/apex/campaigns/{$campaign->id}");

        $response->assertOk()
            ->assertJsonPath('campaign.id', $campaign->id);
    });

    it('cannot access another users campaign', function () {
        $otherUser = User::factory()->create();
        $campaign = ApexCampaign::factory()->create(['user_id' => $otherUser->id]);

        $response = $this->getJson("/api/apex/campaigns/{$campaign->id}");

        $response->assertNotFound();
    });

    it('updates a campaign', function () {
        $campaign = ApexCampaign::factory()->create(['user_id' => $this->user->id]);

        $response = $this->putJson("/api/apex/campaigns/{$campaign->id}", [
            'name' => 'Updated Name',
            'job_titles' => ['VP Sales'],
        ]);

        $response->assertOk()
            ->assertJsonPath('campaign.name', 'Updated Name');

        $this->assertDatabaseHas('apex_campaigns', [
            'id' => $campaign->id,
            'name' => 'Updated Name',
        ]);
    });

    it('deletes a campaign', function () {
        $campaign = ApexCampaign::factory()->create(['user_id' => $this->user->id]);

        $response = $this->deleteJson("/api/apex/campaigns/{$campaign->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('apex_campaigns', ['id' => $campaign->id]);
    });
});

describe('Campaign Status Management', function () {
    it('starts a draft campaign', function () {
        $campaign = ApexCampaign::factory()->create([
            'user_id' => $this->user->id,
            'status' => 'draft',
        ]);

        $response = $this->postJson("/api/apex/campaigns/{$campaign->id}/start");

        $response->assertOk()
            ->assertJsonPath('campaign.status', 'active');

        $campaign->refresh();
        expect($campaign->status)->toBe('active');
        expect($campaign->started_at)->not->toBeNull();
    });

    it('starts a paused campaign', function () {
        $campaign = ApexCampaign::factory()->paused()->create([
            'user_id' => $this->user->id,
        ]);

        $response = $this->postJson("/api/apex/campaigns/{$campaign->id}/start");

        $response->assertOk()
            ->assertJsonPath('campaign.status', 'active');
    });

    it('cannot start an active campaign', function () {
        $campaign = ApexCampaign::factory()->active()->create([
            'user_id' => $this->user->id,
        ]);

        $response = $this->postJson("/api/apex/campaigns/{$campaign->id}/start");

        $response->assertUnprocessable();
    });

    it('pauses an active campaign', function () {
        $campaign = ApexCampaign::factory()->active()->create([
            'user_id' => $this->user->id,
        ]);

        $response = $this->postJson("/api/apex/campaigns/{$campaign->id}/pause");

        $response->assertOk()
            ->assertJsonPath('campaign.status', 'paused');

        $campaign->refresh();
        expect($campaign->paused_at)->not->toBeNull();
    });

    it('cannot pause a non-active campaign', function () {
        $campaign = ApexCampaign::factory()->create([
            'user_id' => $this->user->id,
            'status' => 'draft',
        ]);

        $response = $this->postJson("/api/apex/campaigns/{$campaign->id}/pause");

        $response->assertUnprocessable();
    });

    it('completes an active campaign', function () {
        $campaign = ApexCampaign::factory()->active()->create([
            'user_id' => $this->user->id,
        ]);

        $response = $this->postJson("/api/apex/campaigns/{$campaign->id}/complete");

        $response->assertOk()
            ->assertJsonPath('campaign.status', 'completed');

        $campaign->refresh();
        expect($campaign->completed_at)->not->toBeNull();
    });
});

describe('Campaign Statistics', function () {
    it('returns campaign stats', function () {
        $campaign = ApexCampaign::factory()->create([
            'user_id' => $this->user->id,
            'connections_sent' => 50,
            'connections_accepted' => 25,
            'messages_sent' => 40,
            'replies_received' => 10,
            'meetings_booked' => 3,
        ]);

        $response = $this->getJson("/api/apex/campaigns/{$campaign->id}/stats");

        $response->assertOk()
            ->assertJsonPath('stats.connections_sent', 50)
            ->assertJsonPath('stats.connections_accepted', 25);

        // Check rates separately since JSON may return int or float
        $stats = $response->json('stats');
        expect((float) $stats['acceptance_rate'])->toBe(50.0);
        expect((float) $stats['reply_rate'])->toBe(25.0);
    });
});
