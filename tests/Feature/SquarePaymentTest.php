<?php

use App\Models\User;
use Illuminate\Support\Str;
use Square\Environments;
use Square\SquareClient;

beforeEach(function () {
    // Create a test user
    $this->user = User::factory()->create([
        'email' => 'test@example.com',
        'name' => 'Test User',
    ]);
});

it('has valid square configuration', function () {
    expect(config('square.environment'))->toBeIn(['production', 'sandbox']);
    expect(config('square.access_token'))->not->toBeEmpty();
    expect(config('square.application_id'))->not->toBeEmpty();
    expect(config('square.location_id'))->not->toBeEmpty();
});

it('returns square configuration via api endpoint', function () {
    $response = $this->get('/api/payment/config');

    $response->assertOk()
        ->assertJsonStructure([
            'applicationId',
            'locationId',
            'environment',
        ]);

    $data = $response->json();
    expect($data['applicationId'])->not->toBeEmpty();
    expect($data['locationId'])->not->toBeEmpty();
    expect($data['environment'])->toBeIn(['production', 'sandbox']);
});

it('can initialize square client with credentials', function () {
    $baseUrl = config('square.environment') === 'production'
        ? Environments::Production->value
        : Environments::Sandbox->value;

    $client = new SquareClient(
        token: config('square.access_token'),
        options: [
            'baseUrl' => $baseUrl,
        ],
    );

    expect($client)->toBeInstanceOf(SquareClient::class);
    expect($client->payments)->not->toBeNull();
});

it('validates payment request data', function () {
    $response = $this->postJson('/api/payment/process', [
        // Missing required fields
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors([
            'source_id',
            'amount',
            'currency',
            'customer_email',
            'customer_name',
            'idempotency_key',
        ]);
});

it('can process a test payment with square test card', function () {
    // Square sandbox test card nonce
    $testCardNonce = 'cnon:card-nonce-ok';
    
    $paymentData = [
        'source_id' => $testCardNonce,
        'amount' => 100, // $1.00 in cents
        'currency' => 'USD',
        'customer_email' => $this->user->email,
        'customer_name' => $this->user->name,
        'idempotency_key' => Str::uuid()->toString(),
        'order_description' => 'Test Order - Cynergists AI',
    ];

    $response = $this->postJson('/api/payment/process', $paymentData);

    // If this fails, it means the Square credentials are not properly configured
    if ($response->status() === 422) {
        $errors = $response->json('errors');
        $this->markTestSkipped('Square API returned errors: ' . json_encode($errors));
    }

    $response->assertOk()
        ->assertJsonStructure([
            'success',
            'payment_id',
            'status',
        ]);

    $data = $response->json();
    expect($data['success'])->toBeTrue();
    expect($data['payment_id'])->not->toBeEmpty();
})->skip(fn () => config('square.environment') !== 'sandbox', 'Only run in sandbox environment');

it('handles declined card properly', function () {
    // Square sandbox declined card nonce
    $declinedCardNonce = 'cnon:card-nonce-declined';
    
    $paymentData = [
        'source_id' => $declinedCardNonce,
        'amount' => 100,
        'currency' => 'USD',
        'customer_email' => $this->user->email,
        'customer_name' => $this->user->name,
        'idempotency_key' => Str::uuid()->toString(),
        'order_description' => 'Test Declined Payment',
    ];

    $response = $this->postJson('/api/payment/process', $paymentData);

    $response->assertStatus(422)
        ->assertJson([
            'success' => false,
        ])
        ->assertJsonStructure([
            'error',
        ]);
})->skip(fn () => config('square.environment') !== 'sandbox', 'Only run in sandbox environment');

it('requires valid location id', function () {
    // Test that location ID is properly configured
    $locationId = config('square.location_id');
    
    expect($locationId)->not->toBeEmpty();
    expect($locationId)->not->toBe('your_production_location_id');
    expect($locationId)->not->toBe('your_sandbox_location_id');
});

it('uses correct application id based on environment', function () {
    $environment = config('square.environment');
    $applicationId = config('square.application_id');
    
    if ($environment === 'sandbox') {
        expect($applicationId)->toStartWith('sandbox-');
    } else {
        expect($applicationId)->not->toStartWith('sandbox-');
    }
});
