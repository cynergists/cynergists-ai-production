<?php

use App\Models\ApexCampaign;
use App\Models\ApexCampaignProspect;
use App\Models\ApexProspect;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    Sanctum::actingAs($this->user);
});

describe('Prospect API', function () {
    it('lists user prospects', function () {
        ApexProspect::factory()->count(3)->create(['user_id' => $this->user->id]);
        ApexProspect::factory()->count(2)->create(); // Other user's prospects

        $response = $this->getJson('/api/apex/prospects');

        $response->assertOk();
        expect($response->json('data'))->toHaveCount(3);
    });

    it('filters prospects by connection status', function () {
        ApexProspect::factory()->connected()->create(['user_id' => $this->user->id]);
        ApexProspect::factory()->pendingConnection()->create(['user_id' => $this->user->id]);
        ApexProspect::factory()->create(['user_id' => $this->user->id]);

        $response = $this->getJson('/api/apex/prospects?connection_status=connected');

        $response->assertOk();
        expect($response->json('data'))->toHaveCount(1);
    });

    it('searches prospects by name or company', function () {
        ApexProspect::factory()->create([
            'user_id' => $this->user->id,
            'full_name' => 'John Smith',
        ]);
        ApexProspect::factory()->create([
            'user_id' => $this->user->id,
            'company' => 'Acme Corp',
        ]);
        ApexProspect::factory()->create([
            'user_id' => $this->user->id,
            'full_name' => 'Jane Doe',
        ]);

        $response = $this->getJson('/api/apex/prospects?search=John');

        $response->assertOk();
        expect($response->json('data'))->toHaveCount(1);
    });

    it('creates a prospect', function () {
        $response = $this->postJson('/api/apex/prospects', [
            'first_name' => 'John',
            'last_name' => 'Smith',
            'full_name' => 'John Smith',
            'company' => 'Acme Corp',
            'job_title' => 'CEO',
            'linkedin_profile_url' => 'https://linkedin.com/in/johnsmith',
        ]);

        $response->assertCreated()
            ->assertJsonPath('prospect.full_name', 'John Smith');

        $this->assertDatabaseHas('apex_prospects', [
            'user_id' => $this->user->id,
            'full_name' => 'John Smith',
        ]);
    });

    it('prevents duplicate linkedin profiles', function () {
        ApexProspect::factory()->create([
            'user_id' => $this->user->id,
            'linkedin_profile_id' => 'ABC123',
        ]);

        $response = $this->postJson('/api/apex/prospects', [
            'linkedin_profile_id' => 'ABC123',
            'full_name' => 'Duplicate',
        ]);

        $response->assertUnprocessable()
            ->assertJsonPath('error', 'A prospect with this LinkedIn profile already exists.');
    });

    it('shows a single prospect', function () {
        $prospect = ApexProspect::factory()->create(['user_id' => $this->user->id]);

        $response = $this->getJson("/api/apex/prospects/{$prospect->id}");

        $response->assertOk()
            ->assertJsonPath('prospect.id', $prospect->id);
    });

    it('updates a prospect', function () {
        $prospect = ApexProspect::factory()->create(['user_id' => $this->user->id]);

        $response = $this->putJson("/api/apex/prospects/{$prospect->id}", [
            'job_title' => 'Updated Title',
        ]);

        $response->assertOk()
            ->assertJsonPath('prospect.job_title', 'Updated Title');
    });

    it('deletes a prospect', function () {
        $prospect = ApexProspect::factory()->create(['user_id' => $this->user->id]);

        $response = $this->deleteJson("/api/apex/prospects/{$prospect->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('apex_prospects', ['id' => $prospect->id]);
    });
});

describe('Bulk Prospect Import', function () {
    it('creates multiple prospects', function () {
        $response = $this->postJson('/api/apex/prospects/bulk', [
            'prospects' => [
                ['full_name' => 'John Smith', 'linkedin_profile_id' => 'JS1'],
                ['full_name' => 'Jane Doe', 'linkedin_profile_id' => 'JD1'],
                ['full_name' => 'Bob Wilson', 'linkedin_profile_id' => 'BW1'],
            ],
            'source' => 'apify',
        ]);

        $response->assertCreated()
            ->assertJsonPath('created', 3)
            ->assertJsonPath('skipped', 0);
    });

    it('skips duplicates in bulk import', function () {
        ApexProspect::factory()->create([
            'user_id' => $this->user->id,
            'linkedin_profile_id' => 'EXISTING',
        ]);

        $response = $this->postJson('/api/apex/prospects/bulk', [
            'prospects' => [
                ['full_name' => 'New Person', 'linkedin_profile_id' => 'NEW1'],
                ['full_name' => 'Existing Person', 'linkedin_profile_id' => 'EXISTING'],
            ],
        ]);

        $response->assertCreated()
            ->assertJsonPath('created', 1)
            ->assertJsonPath('skipped', 1);
    });

    it('adds bulk prospects to campaign', function () {
        $campaign = ApexCampaign::factory()->create(['user_id' => $this->user->id]);

        $response = $this->postJson('/api/apex/prospects/bulk', [
            'prospects' => [
                ['full_name' => 'John Smith', 'linkedin_profile_id' => 'JS1'],
                ['full_name' => 'Jane Doe', 'linkedin_profile_id' => 'JD1'],
            ],
            'campaign_id' => $campaign->id,
        ]);

        $response->assertCreated();

        expect(ApexCampaignProspect::where('campaign_id', $campaign->id)->count())->toBe(2);
    });
});

describe('Campaign Prospect Management', function () {
    it('adds prospect to campaign', function () {
        $prospect = ApexProspect::factory()->create(['user_id' => $this->user->id]);
        $campaign = ApexCampaign::factory()->create(['user_id' => $this->user->id]);

        $response = $this->postJson("/api/apex/prospects/{$prospect->id}/add-to-campaign", [
            'campaign_id' => $campaign->id,
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('apex_campaign_prospects', [
            'campaign_id' => $campaign->id,
            'prospect_id' => $prospect->id,
            'status' => 'queued',
        ]);
    });

    it('prevents adding duplicate prospect to campaign', function () {
        $prospect = ApexProspect::factory()->create(['user_id' => $this->user->id]);
        $campaign = ApexCampaign::factory()->create(['user_id' => $this->user->id]);

        ApexCampaignProspect::create([
            'campaign_id' => $campaign->id,
            'prospect_id' => $prospect->id,
            'status' => 'queued',
        ]);

        $response = $this->postJson("/api/apex/prospects/{$prospect->id}/add-to-campaign", [
            'campaign_id' => $campaign->id,
        ]);

        $response->assertUnprocessable()
            ->assertJsonPath('error', 'Prospect is already in this campaign.');
    });

    it('removes prospect from campaign', function () {
        $prospect = ApexProspect::factory()->create(['user_id' => $this->user->id]);
        $campaign = ApexCampaign::factory()->create(['user_id' => $this->user->id]);

        ApexCampaignProspect::create([
            'campaign_id' => $campaign->id,
            'prospect_id' => $prospect->id,
            'status' => 'queued',
        ]);

        $response = $this->postJson("/api/apex/prospects/{$prospect->id}/remove-from-campaign", [
            'campaign_id' => $campaign->id,
        ]);

        $response->assertOk();
        $this->assertDatabaseMissing('apex_campaign_prospects', [
            'campaign_id' => $campaign->id,
            'prospect_id' => $prospect->id,
        ]);
    });
});
