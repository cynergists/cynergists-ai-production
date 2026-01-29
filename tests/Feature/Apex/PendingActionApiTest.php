<?php

use App\Models\ApexCampaign;
use App\Models\ApexPendingAction;
use App\Models\ApexProspect;
use App\Models\PortalAvailableAgent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->agent = PortalAvailableAgent::factory()->create(['name' => 'Apex']);
    Sanctum::actingAs($this->user);
});

describe('Pending Action API', function () {
    it('lists pending actions', function () {
        ApexPendingAction::factory()->count(3)->create([
            'user_id' => $this->user->id,
            'status' => 'pending',
        ]);
        ApexPendingAction::factory()->count(2)->create(); // Other user's actions

        $response = $this->getJson('/api/apex/pending-actions');

        $response->assertOk()
            ->assertJsonPath('total', 3);
    });

    it('excludes expired actions from list', function () {
        ApexPendingAction::factory()->create([
            'user_id' => $this->user->id,
            'status' => 'pending',
            'expires_at' => now()->addDay(),
        ]);
        ApexPendingAction::factory()->expired()->create([
            'user_id' => $this->user->id,
        ]);

        $response = $this->getJson('/api/apex/pending-actions');

        $response->assertOk()
            ->assertJsonPath('total', 1);
    });

    it('shows a single pending action', function () {
        $action = ApexPendingAction::factory()->create([
            'user_id' => $this->user->id,
        ]);

        $response = $this->getJson("/api/apex/pending-actions/{$action->id}");

        $response->assertOk()
            ->assertJsonPath('action.id', $action->id);
    });

    it('cannot access another users pending action', function () {
        $otherUser = User::factory()->create();
        $action = ApexPendingAction::factory()->create([
            'user_id' => $otherUser->id,
        ]);

        $response = $this->getJson("/api/apex/pending-actions/{$action->id}");

        $response->assertNotFound();
    });
});

describe('Pending Action Denial', function () {
    it('denies a pending action', function () {
        $action = ApexPendingAction::factory()->create([
            'user_id' => $this->user->id,
            'status' => 'pending',
        ]);

        $response = $this->postJson("/api/apex/pending-actions/{$action->id}/deny");

        $response->assertOk();

        $action->refresh();
        expect($action->status)->toBe('denied');
    });

    it('cannot deny non-pending action', function () {
        $action = ApexPendingAction::factory()->approved()->create([
            'user_id' => $this->user->id,
        ]);

        $response = $this->postJson("/api/apex/pending-actions/{$action->id}/deny");

        $response->assertUnprocessable();
    });

    it('denies multiple actions', function () {
        $actions = ApexPendingAction::factory()->count(3)->create([
            'user_id' => $this->user->id,
            'status' => 'pending',
        ]);

        $response = $this->postJson('/api/apex/pending-actions/deny-multiple', [
            'action_ids' => $actions->pluck('id')->toArray(),
        ]);

        $response->assertOk()
            ->assertJsonPath('denied', 3);
    });

    it('denies all pending actions', function () {
        ApexPendingAction::factory()->count(5)->create([
            'user_id' => $this->user->id,
            'status' => 'pending',
        ]);

        $response = $this->postJson('/api/apex/pending-actions/deny-all');

        $response->assertOk()
            ->assertJsonPath('denied', 5);
    });
});

describe('Pending Action Model', function () {
    it('checks pending status', function () {
        $pending = ApexPendingAction::factory()->create(['status' => 'pending']);
        $approved = ApexPendingAction::factory()->approved()->create();
        $denied = ApexPendingAction::factory()->denied()->create();

        expect($pending->isPending())->toBeTrue();
        expect($approved->isPending())->toBeFalse();
        expect($denied->isPending())->toBeFalse();
    });

    it('checks expired status', function () {
        $expired = ApexPendingAction::factory()->create([
            'expires_at' => now()->subDay(),
        ]);
        $valid = ApexPendingAction::factory()->create([
            'expires_at' => now()->addDay(),
        ]);
        $noExpiry = ApexPendingAction::factory()->create([
            'expires_at' => null,
        ]);

        expect($expired->isExpired())->toBeTrue();
        expect($valid->isExpired())->toBeFalse();
        expect($noExpiry->isExpired())->toBeFalse();
    });

    it('approves action', function () {
        $action = ApexPendingAction::factory()->create(['status' => 'pending']);

        $result = $action->approve();

        expect($result)->toBeTrue();
        expect($action->status)->toBe('approved');
        expect($action->approved_at)->not->toBeNull();
    });

    it('cannot approve expired action', function () {
        $action = ApexPendingAction::factory()->create([
            'status' => 'pending',
            'expires_at' => now()->subDay(),
        ]);

        $result = $action->approve();

        expect($result)->toBeFalse();
        expect($action->status)->toBe('pending');
    });

    it('marks action as executed', function () {
        $action = ApexPendingAction::factory()->approved()->create();

        $action->markExecuted();

        expect($action->status)->toBe('executed');
        expect($action->executed_at)->not->toBeNull();
    });

    it('has pending scope', function () {
        ApexPendingAction::factory()->create(['status' => 'pending']);
        ApexPendingAction::factory()->approved()->create();
        ApexPendingAction::factory()->denied()->create();

        expect(ApexPendingAction::pending()->count())->toBe(1);
    });

    it('has notExpired scope', function () {
        ApexPendingAction::factory()->create(['expires_at' => now()->addDay()]);
        ApexPendingAction::factory()->create(['expires_at' => null]);
        ApexPendingAction::factory()->create(['expires_at' => now()->subDay()]);

        expect(ApexPendingAction::notExpired()->count())->toBe(2);
    });
});

describe('Pending Action Relationships', function () {
    it('belongs to user', function () {
        $action = ApexPendingAction::factory()->create(['user_id' => $this->user->id]);

        expect($action->user->id)->toBe($this->user->id);
    });

    it('belongs to campaign', function () {
        $campaign = ApexCampaign::factory()->create(['user_id' => $this->user->id]);
        $action = ApexPendingAction::factory()->create([
            'user_id' => $this->user->id,
            'campaign_id' => $campaign->id,
        ]);

        expect($action->campaign->id)->toBe($campaign->id);
    });

    it('belongs to prospect', function () {
        $prospect = ApexProspect::factory()->create(['user_id' => $this->user->id]);
        $action = ApexPendingAction::factory()->create([
            'user_id' => $this->user->id,
            'prospect_id' => $prospect->id,
        ]);

        expect($action->prospect->id)->toBe($prospect->id);
    });
});
