<?php

use App\Models\PortalAvailableAgent;
use App\Models\PortalTenant;
use App\Models\User;
use App\Services\EventEmailService;
use App\Services\IDevAffiliateService;
use App\Services\SquareSubscriptionService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Square\Types\Payment;

use function Pest\Laravel\mock;

beforeEach(function () {
    $this->user = User::factory()->create([
        'email' => 'idev-test@example.com',
        'name' => 'Test User',
    ]);

    $this->tenant = PortalTenant::factory()->create([
        'user_id' => $this->user->id,
    ]);

    PortalAvailableAgent::factory()->create([
        'name' => 'TestAgent',
        'price' => 49.00,
        'billing_type' => 'one_time',
        'category' => 'general',
    ]);

    mock(EventEmailService::class)->shouldIgnoreMissing();
});

/*
|--------------------------------------------------------------------------
| IDevAffiliateService Unit Tests
|--------------------------------------------------------------------------
*/

it('reports sale successfully when configured', function () {
    Http::fake([
        'cynergists.idevaffiliate.com/*' => Http::response('', 200),
    ]);

    config([
        'idevaffiliate.enabled' => true,
        'idevaffiliate.secret' => 'test-secret',
        'idevaffiliate.profile' => 'test-profile',
        'idevaffiliate.url' => 'https://cynergists.idevaffiliate.com/sale.php',
    ]);

    $service = new IDevAffiliateService;

    $result = $service->reportSale([
        'sale_amount' => '49.00',
        'order_number' => 'ORD-123',
        'ip_address' => '127.0.0.1',
        'customer_name' => 'Test User',
        'customer_email' => 'test@example.com',
        'product_info' => 'TestAgent',
    ]);

    expect($result)->toBeTrue();

    Http::assertSent(function ($request) {
        return str_contains($request->url(), 'sale.php')
            && $request['idev_secret'] === 'test-secret'
            && $request['profile'] === 'test-profile'
            && $request['idev_saleamt'] === '49.00'
            && $request['idev_ordernum'] === 'ORD-123'
            && $request['ip_address'] === '127.0.0.1'
            && $request['idev_option_1'] === 'Test User'
            && $request['idev_option_2'] === 'test@example.com'
            && $request['idev_option_3'] === 'TestAgent'
            && $request['idev_currency'] === 'USD';
    });
});

it('returns false and skips when disabled', function () {
    Http::fake();

    config(['idevaffiliate.enabled' => false]);

    $service = new IDevAffiliateService;

    $result = $service->reportSale([
        'sale_amount' => '49.00',
        'order_number' => 'ORD-123',
        'ip_address' => '127.0.0.1',
    ]);

    expect($result)->toBeFalse();

    Http::assertNothingSent();
});

it('returns false when secret is missing', function () {
    Http::fake();

    config([
        'idevaffiliate.enabled' => true,
        'idevaffiliate.secret' => null,
        'idevaffiliate.profile' => 'test-profile',
        'idevaffiliate.url' => 'https://cynergists.idevaffiliate.com/sale.php',
    ]);

    $service = new IDevAffiliateService;

    $result = $service->reportSale([
        'sale_amount' => '49.00',
        'order_number' => 'ORD-123',
        'ip_address' => '127.0.0.1',
    ]);

    expect($result)->toBeFalse();

    Http::assertNothingSent();
});

it('returns false when API returns error status', function () {
    Http::fake([
        'cynergists.idevaffiliate.com/*' => Http::response('error', 500),
    ]);

    config([
        'idevaffiliate.enabled' => true,
        'idevaffiliate.secret' => 'test-secret',
        'idevaffiliate.profile' => 'test-profile',
        'idevaffiliate.url' => 'https://cynergists.idevaffiliate.com/sale.php',
    ]);

    $service = new IDevAffiliateService;

    $result = $service->reportSale([
        'sale_amount' => '49.00',
        'order_number' => 'ORD-123',
        'ip_address' => '127.0.0.1',
    ]);

    expect($result)->toBeFalse();
});

it('returns false when API connection fails', function () {
    Http::fake([
        'cynergists.idevaffiliate.com/*' => fn () => throw new \Illuminate\Http\Client\ConnectionException('timeout'),
    ]);

    config([
        'idevaffiliate.enabled' => true,
        'idevaffiliate.secret' => 'test-secret',
        'idevaffiliate.profile' => 'test-profile',
        'idevaffiliate.url' => 'https://cynergists.idevaffiliate.com/sale.php',
    ]);

    $service = new IDevAffiliateService;

    $result = $service->reportSale([
        'sale_amount' => '49.00',
        'order_number' => 'ORD-123',
        'ip_address' => '127.0.0.1',
    ]);

    expect($result)->toBeFalse();
});

/*
|--------------------------------------------------------------------------
| PaymentController Integration Tests
|--------------------------------------------------------------------------
*/

it('reports commission to iDevAffiliate after successful one-time payment', function () {
    $mockPayment = mock(Payment::class);
    $mockPayment->shouldReceive('getId')->andReturn('sq-pay-idev-1');
    $mockPayment->shouldReceive('getReceiptUrl')->andReturn('https://receipt.example.com');

    $mockSquareService = mock(SquareSubscriptionService::class);
    $mockSquareService->shouldReceive('processOneTimePayment')
        ->once()
        ->andReturn($mockPayment);

    $mockIDevService = mock(IDevAffiliateService::class);
    $mockIDevService->shouldReceive('reportSale')
        ->once()
        ->with(\Mockery::on(function ($data) {
            return $data['sale_amount'] === '49.00'
                && $data['order_number'] === 'sq-pay-idev-1'
                && $data['customer_email'] === 'idev-test@example.com'
                && $data['customer_name'] === 'Test User'
                && str_contains($data['product_info'], 'TestAgent');
        }))
        ->andReturn(true);

    $response = $this->postJson('/api/payment/process', [
        'source_id' => 'cnon:card-nonce-ok',
        'amount' => 4900,
        'currency' => 'USD',
        'customer_email' => $this->user->email,
        'customer_name' => 'Test User',
        'idempotency_key' => (string) Str::uuid(),
        'cart_items' => [
            ['name' => 'TestAgent', 'price' => 4900, 'quantity' => 1, 'billing_type' => 'one_time'],
        ],
    ]);

    $response->assertOk()
        ->assertJson(['success' => true]);
});

it('includes description in product info when provided', function () {
    $mockPayment = mock(Payment::class);
    $mockPayment->shouldReceive('getId')->andReturn('sq-pay-idev-2');
    $mockPayment->shouldReceive('getReceiptUrl')->andReturn('https://receipt.example.com');

    $mockSquareService = mock(SquareSubscriptionService::class);
    $mockSquareService->shouldReceive('processOneTimePayment')
        ->once()
        ->andReturn($mockPayment);

    $mockIDevService = mock(IDevAffiliateService::class);
    $mockIDevService->shouldReceive('reportSale')
        ->once()
        ->with(\Mockery::on(function ($data) {
            return $data['product_info'] === 'TestAgent - Starter Plan';
        }))
        ->andReturn(true);

    $response = $this->postJson('/api/payment/process', [
        'source_id' => 'cnon:card-nonce-ok',
        'amount' => 4900,
        'currency' => 'USD',
        'customer_email' => $this->user->email,
        'customer_name' => 'Test User',
        'idempotency_key' => (string) Str::uuid(),
        'cart_items' => [
            ['name' => 'TestAgent', 'price' => 4900, 'quantity' => 1, 'billing_type' => 'one_time', 'description' => 'Starter Plan'],
        ],
    ]);

    $response->assertOk()
        ->assertJson(['success' => true]);
});

it('does not fail payment when iDevAffiliate report fails', function () {
    $mockPayment = mock(Payment::class);
    $mockPayment->shouldReceive('getId')->andReturn('sq-pay-idev-3');
    $mockPayment->shouldReceive('getReceiptUrl')->andReturn('https://receipt.example.com');

    $mockSquareService = mock(SquareSubscriptionService::class);
    $mockSquareService->shouldReceive('processOneTimePayment')
        ->once()
        ->andReturn($mockPayment);

    $mockIDevService = mock(IDevAffiliateService::class);
    $mockIDevService->shouldReceive('reportSale')
        ->once()
        ->andReturn(false);

    $response = $this->postJson('/api/payment/process', [
        'source_id' => 'cnon:card-nonce-ok',
        'amount' => 4900,
        'currency' => 'USD',
        'customer_email' => $this->user->email,
        'customer_name' => 'Test User',
        'idempotency_key' => (string) Str::uuid(),
        'cart_items' => [
            ['name' => 'TestAgent', 'price' => 4900, 'quantity' => 1, 'billing_type' => 'one_time'],
        ],
    ]);

    $response->assertOk()
        ->assertJson(['success' => true, 'payment_id' => 'sq-pay-idev-3']);
});
