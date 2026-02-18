<?php

use App\Jobs\AttachPortalAgentsToUser;
use App\Models\AgentAccess;
use App\Models\PortalAvailableAgent;
use App\Models\PortalTenant;
use App\Models\User;
use App\Services\SquareSubscriptionService;
use Illuminate\Support\Facades\Queue;
use Mockery\MockInterface;

beforeEach(function () {
    Queue::fake();
    
    // Mock Square service to avoid external API calls
    $this->mock(SquareSubscriptionService::class, function (MockInterface $mock) {
        $mockPayment = \Mockery::mock('Square\Types\Payment');
        $mockPayment->shouldReceive('getId')->andReturn('test-payment-id');
        $mockPayment->shouldReceive('getReceiptUrl')->andReturn('https://example.com/receipt');
        
        $mock->shouldReceive('processOneTimePayment')
            ->andReturn($mockPayment);
    });
});

it('attaches agents to user after successful payment', function () {
    // Create a user
    $user = User::factory()->create([
        'email' => 'test@example.com',
    ]);

    // Create some available agents
    $agent1 = PortalAvailableAgent::factory()->create([
        'name' => 'AI Agent 1',
        'is_active' => true,
    ]);

    $agent2 = PortalAvailableAgent::factory()->create([
        'name' => 'AI Agent 2',
        'is_active' => true,
    ]);

    // Simulate payment data with cart items
    $paymentData = [
        'source_id' => 'cnon:card-nonce-ok',
        'amount' => 10000,
        'currency' => 'USD',
        'customer_email' => $user->email,
        'customer_name' => $user->name,
        'idempotency_key' => 'test-'.time(),
        'order_description' => 'Test Order',
        'cart_items' => [
            [
                'name' => 'AI Agent 1',
                'description' => 'Test agent 1',
                'quantity' => 1,
                'price' => 5000,
                'billing_type' => 'one_time',
            ],
            [
                'name' => 'AI Agent 2',
                'description' => 'Test agent 2',
                'quantity' => 1,
                'price' => 5000,
                'billing_type' => 'one_time',
            ],
        ],
    ];

    $response = $this->postJson('/api/payment/process', $paymentData);

    $response->assertStatus(200);

    // Verify the agents were actually attached to the user's tenant
    $tenant = PortalTenant::forUser($user);
    expect($tenant)->not->toBeNull();
    
    $this->assertDatabaseHas('agent_access', [
        'tenant_id' => $tenant->id,
        'agent_name' => 'AI Agent 1',
        'is_active' => true,
    ]);
    
    $this->assertDatabaseHas('agent_access', [
        'tenant_id' => $tenant->id,
        'agent_name' => 'AI Agent 2',
        'is_active' => true,
    ]);
});

it('attaches purchased agents to user tenant', function () {
    // Create a user
    $user = User::factory()->create([
        'email' => 'test@example.com',
    ]);

    // Create a portal tenant
    $tenant = PortalTenant::factory()->create([
        'user_id' => $user->id,
    ]);

    // Create available agents
    $agent1 = PortalAvailableAgent::factory()->create([
        'name' => 'AI Agent 1',
        'is_active' => true,
    ]);

    $agent2 = PortalAvailableAgent::factory()->create([
        'name' => 'AI Agent 2',
        'is_active' => true,
    ]);

    $agent3 = PortalAvailableAgent::factory()->create([
        'name' => 'AI Agent 3',
        'is_active' => true,
    ]);

    // Run the job with only specific agents
    $job = new AttachPortalAgentsToUser(
        email: $user->email,
        companyName: null,
        subdomain: null,
        agentNames: ['AI Agent 1', 'AI Agent 2']
    );

    app()->call([$job, 'handle']);

    // Verify only the specified agents were attached
    $this->assertDatabaseHas('agent_access', [
        'tenant_id' => $tenant->id,
        'agent_name' => 'AI Agent 1',
        'is_active' => true,
    ]);

    $this->assertDatabaseHas('agent_access', [
        'tenant_id' => $tenant->id,
        'agent_name' => 'AI Agent 2',
        'is_active' => true,
    ]);

    // Verify the third agent was NOT attached
    $this->assertDatabaseMissing('agent_access', [
        'tenant_id' => $tenant->id,
        'agent_name' => 'AI Agent 3',
    ]);
});

it('attaches all active agents when no specific agents are provided', function () {
    // Create a user
    $user = User::factory()->create([
        'email' => 'test@example.com',
    ]);

    // Create a portal tenant
    $tenant = PortalTenant::factory()->create([
        'user_id' => $user->id,
    ]);

    // Create available agents
    $agent1 = PortalAvailableAgent::factory()->create([
        'name' => 'AI Agent 1',
        'is_active' => true,
    ]);

    $agent2 = PortalAvailableAgent::factory()->create([
        'name' => 'AI Agent 2',
        'is_active' => true,
    ]);

    $agent3 = PortalAvailableAgent::factory()->create([
        'name' => 'AI Agent 3',
        'is_active' => false,
    ]);

    // Run the job with no specific agents (original behavior)
    $job = new AttachPortalAgentsToUser(
        email: $user->email,
        companyName: null,
        subdomain: null,
        agentNames: null
    );

    app()->call([$job, 'handle']);

    // Verify all active agents were attached
    $this->assertDatabaseHas('agent_access', [
        'tenant_id' => $tenant->id,
        'agent_name' => 'AI Agent 1',
        'is_active' => true,
    ]);

    $this->assertDatabaseHas('agent_access', [
        'tenant_id' => $tenant->id,
        'agent_name' => 'AI Agent 2',
        'is_active' => true,
    ]);

    // Verify inactive agent was NOT attached
    $this->assertDatabaseMissing('agent_access', [
        'tenant_id' => $tenant->id,
        'agent_name' => 'AI Agent 3',
    ]);
});

it('creates tenant if user does not have one', function () {
    // Create a user without a tenant
    $user = User::factory()->create([
        'email' => 'newuser@example.com',
    ]);

    // Create an available agent
    $agent = PortalAvailableAgent::factory()->create([
        'name' => 'AI Agent 1',
        'is_active' => true,
    ]);

    // Run the job
    $job = new AttachPortalAgentsToUser(
        email: $user->email,
        companyName: 'Test Company',
        subdomain: 'test-company',
        agentNames: ['AI Agent 1']
    );

    app()->call([$job, 'handle']);

    // Verify tenant was created
    $this->assertDatabaseHas('portal_tenants', [
        'user_id' => $user->id,
        'company_name' => 'Test Company',
        'subdomain' => 'test-company',
    ]);

    // Verify agent was attached to the new tenant
    $tenant = PortalTenant::where('user_id', $user->id)->first();
    $this->assertDatabaseHas('agent_access', [
        'tenant_id' => $tenant->id,
        'agent_name' => 'AI Agent 1',
        'is_active' => true,
    ]);
});
