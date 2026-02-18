<?php

use App\Jobs\Apex\SyncLinkedInMessagesJob;
use App\Models\ApexLinkedInAccount;
use App\Models\PortalAvailableAgent;
use App\Models\User;
use App\Services\Apex\UnipileService;
use App\Services\EventEmailService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->agent = PortalAvailableAgent::factory()->create(['name' => 'Apex']);
    $this->mock(EventEmailService::class)->shouldIgnoreMissing();
});

it('lists linkedin accounts for authenticated user', function () {
    ApexLinkedInAccount::factory()->count(2)->create(['user_id' => $this->user->id]);
    ApexLinkedInAccount::factory()->create(); // other user's account

    $response = $this->actingAs($this->user)
        ->getJson('/api/apex/linkedin');

    $response->assertSuccessful()
        ->assertJsonCount(2, 'accounts')
        ->assertJsonStructure([
            'accounts' => [['id', 'display_name', 'email', 'status', 'unipile_account_id']],
        ]);
});

it('returns empty accounts list when user has none', function () {
    $response = $this->actingAs($this->user)
        ->getJson('/api/apex/linkedin');

    $response->assertSuccessful()
        ->assertJsonCount(0, 'accounts');
});

it('returns 401 for unauthenticated requests', function () {
    $this->getJson('/api/apex/linkedin')->assertUnauthorized();
});

it('disconnects a linkedin account', function () {
    $account = ApexLinkedInAccount::factory()->create([
        'user_id' => $this->user->id,
    ]);

    $this->mock(UnipileService::class, function ($mock) {
        $mock->shouldReceive('forAgent')->once()->andReturnSelf();
        $mock->shouldReceive('isConfigured')->once()->andReturn(true);
        $mock->shouldReceive('disconnectAccount')->once()->andReturn(true);
    });

    $response = $this->actingAs($this->user)
        ->deleteJson("/api/apex/linkedin/{$account->id}?agent_id={$this->agent->id}");

    $response->assertSuccessful()
        ->assertJsonPath('success', true);

    $this->assertDatabaseMissing('apex_linkedin_accounts', ['id' => $account->id]);
});

it('cannot disconnect another users linkedin account', function () {
    $otherUser = User::factory()->create();
    $account = ApexLinkedInAccount::factory()->create([
        'user_id' => $otherUser->id,
    ]);

    $this->mock(UnipileService::class)->shouldIgnoreMissing();

    $response = $this->actingAs($this->user)
        ->deleteJson("/api/apex/linkedin/{$account->id}?agent_id={$this->agent->id}");

    $response->assertNotFound();
    $this->assertDatabaseHas('apex_linkedin_accounts', ['id' => $account->id]);
});

it('triggers a linkedin sync job', function () {
    Queue::fake();

    $response = $this->actingAs($this->user)
        ->postJson('/api/apex/sync');

    $response->assertSuccessful()
        ->assertJsonPath('message', 'Sync triggered.');

    Queue::assertPushed(SyncLinkedInMessagesJob::class, function ($job) {
        return $job->user->id === $this->user->id;
    });
});

it('throttles sync requests', function () {
    Queue::fake();

    $this->actingAs($this->user)->postJson('/api/apex/sync')->assertSuccessful();
    $response = $this->actingAs($this->user)->postJson('/api/apex/sync');

    $response->assertSuccessful()
        ->assertJsonPath('message', 'Sync already scheduled recently.');

    Queue::assertPushed(SyncLinkedInMessagesJob::class, 1);
});

it('does not return other users linkedin accounts', function () {
    $otherUser = User::factory()->create();
    ApexLinkedInAccount::factory()->count(3)->create(['user_id' => $otherUser->id]);
    ApexLinkedInAccount::factory()->create(['user_id' => $this->user->id]);

    $response = $this->actingAs($this->user)
        ->getJson('/api/apex/linkedin');

    $response->assertSuccessful()
        ->assertJsonCount(1, 'accounts');
});
