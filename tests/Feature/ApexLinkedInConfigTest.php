<?php

use App\Models\AgentAccess;
use App\Models\ApexLinkedInAccount;
use App\Models\CustomerSubscription;
use App\Models\PortalAvailableAgent;
use App\Models\PortalTenant;
use App\Models\User;
use App\Services\EventEmailService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->tenant = PortalTenant::factory()->create(['user_id' => $this->user->id]);
    $this->subscription = CustomerSubscription::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->availableAgent = PortalAvailableAgent::factory()->create(['name' => 'Apex']);
    $this->agentAccess = AgentAccess::factory()->create([
        'tenant_id' => $this->tenant->id,
        'subscription_id' => $this->subscription->id,
        'agent_name' => 'Apex',
        'is_active' => true,
    ]);

    $this->mock(EventEmailService::class)->shouldIgnoreMissing();
});

it('includes apex_data with linkedin status when agent is Apex', function () {
    $response = $this->actingAs($this->user)
        ->getJson("/api/portal/agents/{$this->agentAccess->id}");

    $response->assertSuccessful()
        ->assertJsonPath('agent.apex_data.linkedin.connected', false)
        ->assertJsonPath('agent.apex_data.linkedin.status', null)
        ->assertJsonPath('agent.apex_data.available_agent_id', $this->availableAgent->id);
});

it('shows linkedin as connected when user has an active account', function () {
    $linkedInAccount = ApexLinkedInAccount::factory()->create([
        'user_id' => $this->user->id,
        'status' => 'active',
        'display_name' => 'John Doe',
    ]);

    $response = $this->actingAs($this->user)
        ->getJson("/api/portal/agents/{$this->agentAccess->id}");

    $response->assertSuccessful()
        ->assertJsonPath('agent.apex_data.linkedin.connected', true)
        ->assertJsonPath('agent.apex_data.linkedin.status', 'active')
        ->assertJsonPath('agent.apex_data.linkedin.display_name', 'John Doe')
        ->assertJsonPath('agent.apex_data.linkedin.account_id', $linkedInAccount->id);
});

it('shows linkedin as pending when account is pending', function () {
    ApexLinkedInAccount::factory()->pending()->create([
        'user_id' => $this->user->id,
    ]);

    $response = $this->actingAs($this->user)
        ->getJson("/api/portal/agents/{$this->agentAccess->id}");

    $response->assertSuccessful()
        ->assertJsonPath('agent.apex_data.linkedin.connected', false)
        ->assertJsonPath('agent.apex_data.linkedin.status', 'pending');
});

it('shows linkedin requires checkpoint when account has checkpoint', function () {
    ApexLinkedInAccount::factory()->withCheckpoint('captcha')->create([
        'user_id' => $this->user->id,
    ]);

    $response = $this->actingAs($this->user)
        ->getJson("/api/portal/agents/{$this->agentAccess->id}");

    $response->assertSuccessful()
        ->assertJsonPath('agent.apex_data.linkedin.requires_checkpoint', true);
});

it('does not include apex_data for non-Apex agents', function () {
    $carbonAvailable = PortalAvailableAgent::factory()->create(['name' => 'Carbon']);
    $carbonAccess = AgentAccess::factory()->create([
        'tenant_id' => $this->tenant->id,
        'subscription_id' => $this->subscription->id,
        'agent_name' => 'Carbon',
        'is_active' => true,
    ]);

    $response = $this->actingAs($this->user)
        ->getJson("/api/portal/agents/{$carbonAccess->id}");

    $response->assertSuccessful()
        ->assertJsonMissing(['apex_data']);
});
