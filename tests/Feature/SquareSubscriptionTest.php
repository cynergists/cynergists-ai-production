<?php

use App\Models\AgentAccess;
use App\Models\CustomerSubscription;
use App\Models\PortalAvailableAgent;
use App\Models\PortalTenant;
use App\Models\User;
use App\Services\EventEmailService;
use App\Services\IDevAffiliateService;
use App\Services\SquareSubscriptionService;
use Illuminate\Support\Str;
use Square\Types\CancelSubscriptionResponse;
use Square\Types\CreateSubscriptionResponse;
use Square\Types\Payment;
use Square\Types\Subscription;

use function Pest\Laravel\mock;

beforeEach(function () {
    $this->user = User::factory()->create([
        'email' => 'subscription-test@example.com',
        'name' => 'Test User',
    ]);

    $this->tenant = PortalTenant::factory()->create([
        'user_id' => $this->user->id,
        'square_customer_id' => 'sq-cust-test-123',
    ]);

    $this->monthlyAgent = PortalAvailableAgent::factory()->create([
        'name' => 'TestMonthlyAgent',
        'price' => 99.00,
        'billing_type' => 'monthly',
        'category' => 'marketing',
    ]);

    $this->oneTimeAgent = PortalAvailableAgent::factory()->create([
        'name' => 'TestOneTimeAgent',
        'price' => 49.00,
        'billing_type' => 'one_time',
        'category' => 'general',
    ]);

    // Mock EventEmailService to prevent actual email sending
    mock(EventEmailService::class)->shouldIgnoreMissing();
    mock(IDevAffiliateService::class)->shouldIgnoreMissing();
});

/*
|--------------------------------------------------------------------------
| Payment Processing Tests
|--------------------------------------------------------------------------
*/

it('validates payment request requires cart_items with billing_type', function () {
    $response = $this->postJson('/api/payment/process', [
        'source_id' => 'cnon:card-nonce-ok',
        'amount' => 9900,
        'currency' => 'USD',
        'customer_email' => $this->user->email,
        'customer_name' => $this->user->name,
        'idempotency_key' => (string) Str::uuid(),
        'cart_items' => [
            ['name' => 'Agent', 'price' => 9900, 'quantity' => 1],
        ],
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['cart_items.0.billing_type']);
});

it('validates billing_type must be monthly or one_time', function () {
    $response = $this->postJson('/api/payment/process', [
        'source_id' => 'cnon:card-nonce-ok',
        'amount' => 9900,
        'currency' => 'USD',
        'customer_email' => $this->user->email,
        'customer_name' => $this->user->name,
        'idempotency_key' => (string) Str::uuid(),
        'cart_items' => [
            ['name' => 'Agent', 'price' => 9900, 'quantity' => 1, 'billing_type' => 'weekly'],
        ],
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['cart_items.0.billing_type']);
});

it('processes monthly-only cart with mocked Square service', function () {
    $mockSubscription = mock(Subscription::class);
    $mockSubscription->shouldReceive('getId')->andReturn('sq-sub-123');

    $mockResponse = mock(CreateSubscriptionResponse::class);
    $mockResponse->shouldReceive('getSubscription')->andReturn($mockSubscription);

    $mockService = mock(SquareSubscriptionService::class);
    $mockService->shouldReceive('getOrCreateSquareCustomer')
        ->once()
        ->andReturn('sq-cust-test-123');
    $mockService->shouldReceive('createCardOnFile')
        ->once()
        ->with('sq-cust-test-123', 'cnon:card-nonce-ok')
        ->andReturn('sq-card-123');
    $mockService->shouldReceive('createSubscription')
        ->once()
        ->andReturn($mockResponse);

    $response = $this->postJson('/api/payment/process', [
        'source_id' => 'cnon:card-nonce-ok',
        'amount' => 9900,
        'currency' => 'USD',
        'customer_email' => $this->user->email,
        'customer_name' => $this->user->name,
        'idempotency_key' => (string) Str::uuid(),
        'cart_items' => [
            ['name' => 'TestMonthlyAgent', 'price' => 9900, 'quantity' => 1, 'billing_type' => 'monthly'],
        ],
    ]);

    $response->assertOk()
        ->assertJson(['success' => true]);

    // Verify per-agent subscription was created
    $this->assertDatabaseHas('customer_subscriptions', [
        'tenant_id' => $this->tenant->id,
        'billing_type' => 'monthly',
        'square_subscription_id' => 'sq-sub-123',
        'square_card_id' => 'sq-card-123',
        'auto_renew' => true,
    ]);

    // Verify agent access was created
    $this->assertDatabaseHas('agent_access', [
        'tenant_id' => $this->tenant->id,
        'agent_name' => 'TestMonthlyAgent',
        'is_active' => true,
    ]);
});

it('processes one-time-only cart without creating subscriptions', function () {
    $mockPayment = mock(Payment::class);
    $mockPayment->shouldReceive('getId')->andReturn('sq-pay-456');
    $mockPayment->shouldReceive('getReceiptUrl')->andReturn('https://receipt.example.com');

    $mockService = mock(SquareSubscriptionService::class);
    $mockService->shouldReceive('processOneTimePayment')
        ->once()
        ->andReturn($mockPayment);

    // Should NOT call subscription-related methods
    $mockService->shouldNotReceive('getOrCreateSquareCustomer');
    $mockService->shouldNotReceive('createCardOnFile');
    $mockService->shouldNotReceive('createSubscription');

    $response = $this->postJson('/api/payment/process', [
        'source_id' => 'cnon:card-nonce-ok',
        'amount' => 4900,
        'currency' => 'USD',
        'customer_email' => $this->user->email,
        'customer_name' => $this->user->name,
        'idempotency_key' => (string) Str::uuid(),
        'cart_items' => [
            ['name' => 'TestOneTimeAgent', 'price' => 4900, 'quantity' => 1, 'billing_type' => 'one_time'],
        ],
    ]);

    $response->assertOk()
        ->assertJson([
            'success' => true,
            'payment_id' => 'sq-pay-456',
        ]);

    // Verify per-agent subscription was created with one_time type
    $this->assertDatabaseHas('customer_subscriptions', [
        'tenant_id' => $this->tenant->id,
        'billing_type' => 'one_time',
        'auto_renew' => false,
    ]);
});

it('processes mixed cart with monthly and one-time items', function () {
    $mockSubscription = mock(Subscription::class);
    $mockSubscription->shouldReceive('getId')->andReturn('sq-sub-mixed-1');

    $mockSubResponse = mock(CreateSubscriptionResponse::class);
    $mockSubResponse->shouldReceive('getSubscription')->andReturn($mockSubscription);

    $mockPayment = mock(Payment::class);
    $mockPayment->shouldReceive('getId')->andReturn('sq-pay-mixed-1');
    $mockPayment->shouldReceive('getReceiptUrl')->andReturn('https://receipt.example.com/mixed');

    $mockService = mock(SquareSubscriptionService::class);
    $mockService->shouldReceive('getOrCreateSquareCustomer')
        ->once()
        ->andReturn('sq-cust-test-123');
    $mockService->shouldReceive('createCardOnFile')
        ->once()
        ->andReturn('sq-card-mixed');
    $mockService->shouldReceive('createSubscription')
        ->once()
        ->andReturn($mockSubResponse);
    $mockService->shouldReceive('processOneTimePayment')
        ->once()
        ->andReturn($mockPayment);

    $response = $this->postJson('/api/payment/process', [
        'source_id' => 'cnon:card-nonce-ok',
        'amount' => 14800,
        'currency' => 'USD',
        'customer_email' => $this->user->email,
        'customer_name' => $this->user->name,
        'idempotency_key' => (string) Str::uuid(),
        'cart_items' => [
            ['name' => 'TestMonthlyAgent', 'price' => 9900, 'quantity' => 1, 'billing_type' => 'monthly'],
            ['name' => 'TestOneTimeAgent', 'price' => 4900, 'quantity' => 1, 'billing_type' => 'one_time'],
        ],
    ]);

    $response->assertOk()
        ->assertJson(['success' => true]);

    // Verify both agents attached
    $this->assertDatabaseHas('agent_access', [
        'tenant_id' => $this->tenant->id,
        'agent_name' => 'TestMonthlyAgent',
        'is_active' => true,
    ]);
    $this->assertDatabaseHas('agent_access', [
        'tenant_id' => $this->tenant->id,
        'agent_name' => 'TestOneTimeAgent',
        'is_active' => true,
    ]);

    // Verify monthly subscription
    $this->assertDatabaseHas('customer_subscriptions', [
        'tenant_id' => $this->tenant->id,
        'billing_type' => 'monthly',
        'square_subscription_id' => 'sq-sub-mixed-1',
        'auto_renew' => true,
    ]);

    // Verify one-time subscription
    $this->assertDatabaseHas('customer_subscriptions', [
        'tenant_id' => $this->tenant->id,
        'billing_type' => 'one_time',
        'auto_renew' => false,
    ]);
});

it('returns error when user not found during payment', function () {
    mock(SquareSubscriptionService::class)->shouldIgnoreMissing();

    $response = $this->postJson('/api/payment/process', [
        'source_id' => 'cnon:card-nonce-ok',
        'amount' => 9900,
        'currency' => 'USD',
        'customer_email' => 'nonexistent@example.com',
        'customer_name' => 'Nobody',
        'idempotency_key' => (string) Str::uuid(),
        'cart_items' => [
            ['name' => 'TestMonthlyAgent', 'price' => 9900, 'quantity' => 1, 'billing_type' => 'monthly'],
        ],
    ]);

    $response->assertUnprocessable()
        ->assertJson([
            'success' => false,
            'error' => 'User account not found. Please register first.',
        ]);
});

/*
|--------------------------------------------------------------------------
| Account Unsubscribe Tests
|--------------------------------------------------------------------------
*/

it('cancels monthly subscription via Square API and sets pending_cancellation', function () {
    $subscription = CustomerSubscription::factory()->create([
        'tenant_id' => $this->tenant->id,
        'billing_type' => 'monthly',
        'square_subscription_id' => 'sq-sub-to-cancel',
        'square_card_id' => 'sq-card-abc',
        'status' => 'active',
        'auto_renew' => true,
    ]);

    $agentAccess = AgentAccess::factory()->create([
        'tenant_id' => $this->tenant->id,
        'subscription_id' => $subscription->id,
        'agent_name' => 'TestMonthlyAgent',
        'is_active' => true,
    ]);

    $mockCancelResponse = mock(CancelSubscriptionResponse::class);
    $mockService = mock(SquareSubscriptionService::class);
    $mockService->shouldReceive('cancelSubscription')
        ->once()
        ->with('sq-sub-to-cancel')
        ->andReturn($mockCancelResponse);

    $mockEmailService = mock(EventEmailService::class);
    $mockEmailService->shouldReceive('fire')
        ->once()
        ->with('subscription_cancelled', \Mockery::on(function ($data) {
            return $data['user']->id === $this->user->id
                && $data['agent']->name === 'TestMonthlyAgent'
                && $data['tenant']->id === $this->tenant->id;
        }));

    $this->actingAs($this->user)
        ->postJson("/api/portal/account/unsubscribe/{$agentAccess->id}")
        ->assertOk()
        ->assertJson([
            'success' => true,
            'message' => 'Subscription cancelled. Access will remain active until the end of your billing period.',
        ]);

    // Subscription should be pending_cancellation, not canceled
    $this->assertDatabaseHas('customer_subscriptions', [
        'id' => $subscription->id,
        'status' => 'pending_cancellation',
    ]);

    // Agent access should still be active (until webhook confirms)
    $this->assertDatabaseHas('agent_access', [
        'id' => $agentAccess->id,
        'is_active' => true,
    ]);
});

it('immediately deactivates one-time agent on unsubscribe', function () {
    mock(SquareSubscriptionService::class)->shouldIgnoreMissing();

    $subscription = CustomerSubscription::factory()->create([
        'tenant_id' => $this->tenant->id,
        'billing_type' => 'one_time',
        'square_subscription_id' => null,
        'status' => 'active',
        'auto_renew' => false,
    ]);

    $agentAccess = AgentAccess::factory()->create([
        'tenant_id' => $this->tenant->id,
        'subscription_id' => $subscription->id,
        'agent_name' => 'TestOneTimeAgent',
        'is_active' => true,
    ]);

    $mockEmailService = mock(EventEmailService::class);
    $mockEmailService->shouldReceive('fire')
        ->once()
        ->with('subscription_cancelled', \Mockery::on(function ($data) {
            return $data['user']->id === $this->user->id
                && $data['agent']->name === 'TestOneTimeAgent'
                && $data['tenant']->id === $this->tenant->id;
        }));

    $this->actingAs($this->user)
        ->postJson("/api/portal/account/unsubscribe/{$agentAccess->id}")
        ->assertOk()
        ->assertJson([
            'success' => true,
            'message' => 'Agent unsubscribed successfully.',
        ]);

    // Agent access should be immediately deactivated
    $this->assertDatabaseHas('agent_access', [
        'id' => $agentAccess->id,
        'is_active' => false,
    ]);
});

it('includes billing_type in account index response', function () {
    mock(SquareSubscriptionService::class)->shouldIgnoreMissing();

    $subscription = CustomerSubscription::factory()->create([
        'tenant_id' => $this->tenant->id,
        'billing_type' => 'monthly',
        'square_subscription_id' => 'sq-sub-view',
        'status' => 'active',
    ]);

    AgentAccess::factory()->create([
        'tenant_id' => $this->tenant->id,
        'subscription_id' => $subscription->id,
        'agent_name' => 'TestMonthlyAgent',
        'is_active' => true,
    ]);

    $response = $this->actingAs($this->user)
        ->getJson('/api/portal/account');

    $response->assertOk();

    $agents = $response->json('agents');
    expect($agents)->toHaveCount(1);
    expect($agents[0]['billing_type'])->toBe('monthly');
    expect($agents[0]['subscription']['square_subscription_id'])->toBe('sq-sub-view');
});

/*
|--------------------------------------------------------------------------
| Webhook Tests
|--------------------------------------------------------------------------
*/

it('rejects webhook with invalid signature', function () {
    config(['square.webhook_signature_key' => 'test-webhook-key']);

    $response = $this->postJson('/api/webhooks/square', [
        'type' => 'subscription.updated',
    ], [
        'x-square-hmacsha256-signature' => 'invalid-signature',
    ]);

    $response->assertForbidden()
        ->assertJson(['error' => 'Invalid signature']);
});

it('rejects webhook with missing signature', function () {
    config(['square.webhook_signature_key' => 'test-webhook-key']);

    $response = $this->postJson('/api/webhooks/square', [
        'type' => 'subscription.updated',
    ]);

    $response->assertForbidden();
});

it('handles subscription.updated webhook and syncs CANCELED status', function () {
    $sigKey = 'test-webhook-sig-key';
    config(['square.webhook_signature_key' => $sigKey]);

    $subscription = CustomerSubscription::factory()->create([
        'tenant_id' => $this->tenant->id,
        'billing_type' => 'monthly',
        'square_subscription_id' => 'sq-sub-webhook-cancel',
        'status' => 'pending_cancellation',
    ]);

    $agentAccess = AgentAccess::factory()->create([
        'tenant_id' => $this->tenant->id,
        'subscription_id' => $subscription->id,
        'agent_name' => 'TestMonthlyAgent',
        'is_active' => true,
    ]);

    $payload = json_encode([
        'type' => 'subscription.updated',
        'data' => [
            'object' => [
                'subscription' => [
                    'id' => 'sq-sub-webhook-cancel',
                    'status' => 'CANCELED',
                ],
            ],
        ],
    ]);

    $webhookUrl = config('app.url').'/api/webhooks/square';
    $signature = base64_encode(hash_hmac('sha256', $webhookUrl.$payload, $sigKey, true));

    $response = $this->call('POST', '/api/webhooks/square', [], [], [], [
        'CONTENT_TYPE' => 'application/json',
        'HTTP_X_SQUARE_HMACSHA256_SIGNATURE' => $signature,
    ], $payload);

    $response->assertOk()
        ->assertJson(['success' => true]);

    // Subscription status should be updated to canceled
    $this->assertDatabaseHas('customer_subscriptions', [
        'id' => $subscription->id,
        'status' => 'canceled',
    ]);

    // Agent access should be deactivated
    $this->assertDatabaseHas('agent_access', [
        'id' => $agentAccess->id,
        'is_active' => false,
    ]);
});

it('handles subscription.updated webhook for ACTIVE status without deactivating', function () {
    $sigKey = 'test-webhook-sig-key';
    config(['square.webhook_signature_key' => $sigKey]);

    $subscription = CustomerSubscription::factory()->create([
        'tenant_id' => $this->tenant->id,
        'billing_type' => 'monthly',
        'square_subscription_id' => 'sq-sub-webhook-active',
        'status' => 'pending',
    ]);

    $agentAccess = AgentAccess::factory()->create([
        'tenant_id' => $this->tenant->id,
        'subscription_id' => $subscription->id,
        'agent_name' => 'TestMonthlyAgent',
        'is_active' => true,
    ]);

    $payload = json_encode([
        'type' => 'subscription.updated',
        'data' => [
            'object' => [
                'subscription' => [
                    'id' => 'sq-sub-webhook-active',
                    'status' => 'ACTIVE',
                ],
            ],
        ],
    ]);

    $webhookUrl = config('app.url').'/api/webhooks/square';
    $signature = base64_encode(hash_hmac('sha256', $webhookUrl.$payload, $sigKey, true));

    $response = $this->call('POST', '/api/webhooks/square', [], [], [], [
        'CONTENT_TYPE' => 'application/json',
        'HTTP_X_SQUARE_HMACSHA256_SIGNATURE' => $signature,
    ], $payload);

    $response->assertOk();

    // Subscription should be active
    $this->assertDatabaseHas('customer_subscriptions', [
        'id' => $subscription->id,
        'status' => 'active',
    ]);

    // Agent access should remain active
    $this->assertDatabaseHas('agent_access', [
        'id' => $agentAccess->id,
        'is_active' => true,
    ]);
});

it('handles webhook for unknown subscription gracefully', function () {
    $sigKey = 'test-webhook-sig-key';
    config(['square.webhook_signature_key' => $sigKey]);

    $payload = json_encode([
        'type' => 'subscription.updated',
        'data' => [
            'object' => [
                'subscription' => [
                    'id' => 'sq-sub-nonexistent',
                    'status' => 'CANCELED',
                ],
            ],
        ],
    ]);

    $webhookUrl = config('app.url').'/api/webhooks/square';
    $signature = base64_encode(hash_hmac('sha256', $webhookUrl.$payload, $sigKey, true));

    $response = $this->call('POST', '/api/webhooks/square', [], [], [], [
        'CONTENT_TYPE' => 'application/json',
        'HTTP_X_SQUARE_HMACSHA256_SIGNATURE' => $signature,
    ], $payload);

    // Should still return success (acknowledged but no action taken)
    $response->assertOk()
        ->assertJson(['success' => true]);
});
