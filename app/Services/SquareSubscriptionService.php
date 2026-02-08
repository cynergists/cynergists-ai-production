<?php

namespace App\Services;

use App\Models\PortalTenant;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Square\Cards\Requests\CreateCardRequest;
use Square\Customers\Requests\CreateCustomerRequest;
use Square\Environments;
use Square\Payments\Requests\CreatePaymentRequest;
use Square\SquareClient;
use Square\Subscriptions\Requests\CancelSubscriptionsRequest;
use Square\Subscriptions\Requests\CreateSubscriptionRequest;
use Square\Types\CancelSubscriptionResponse;
use Square\Types\Card;
use Square\Types\CreateSubscriptionResponse;
use Square\Types\Money;
use Square\Types\Payment;

class SquareSubscriptionService
{
    private SquareClient $squareClient;

    public function __construct()
    {
        $baseUrl = config('square.environment') === 'production'
            ? Environments::Production->value
            : Environments::Sandbox->value;

        $this->squareClient = new SquareClient(
            token: config('square.access_token'),
            options: [
                'baseUrl' => $baseUrl,
            ],
        );
    }

    /**
     * Get or create a Square Customer for the given tenant.
     * If tenant already has square_customer_id, returns it.
     * Otherwise creates a new Square Customer and saves the ID to the tenant.
     */
    public function getOrCreateSquareCustomer(PortalTenant $tenant, User $user): string
    {
        if ($tenant->square_customer_id) {
            return $tenant->square_customer_id;
        }

        $profile = $user->profile;

        $response = $this->squareClient->customers->create(
            new CreateCustomerRequest([
                'idempotencyKey' => (string) Str::uuid(),
                'givenName' => $profile?->first_name ?? $user->name,
                'familyName' => $profile?->last_name ?? '',
                'emailAddress' => $user->email,
                'companyName' => $tenant->company_name,
                'referenceId' => (string) $tenant->id,
            ]),
        );

        $customer = $response->getCustomer();
        if (! $customer) {
            $errors = $response->getErrors() ?? [];
            $errorMessages = array_map(fn ($e) => $e->getDetail(), $errors);
            Log::error('Failed to create Square customer', ['errors' => $errorMessages]);

            throw new \RuntimeException('Failed to create Square customer: '.($errorMessages[0] ?? 'Unknown error'));
        }

        $squareCustomerId = $customer->getId();
        $tenant->square_customer_id = $squareCustomerId;
        $tenant->save();

        Log::info('Created Square customer', [
            'tenant_id' => $tenant->id,
            'square_customer_id' => $squareCustomerId,
        ]);

        return $squareCustomerId;
    }

    /**
     * Create a Card on File from a payment token (sourceId from Web Payments SDK).
     * Returns the Square Card ID string.
     */
    public function createCardOnFile(string $squareCustomerId, string $sourceId): string
    {
        $response = $this->squareClient->cards->create(
            new CreateCardRequest([
                'idempotencyKey' => (string) Str::uuid(),
                'sourceId' => $sourceId,
                'card' => new Card([
                    'customerId' => $squareCustomerId,
                ]),
            ]),
        );

        $card = $response->getCard();
        if (! $card) {
            $errors = $response->getErrors() ?? [];
            $errorMessages = array_map(fn ($e) => $e->getDetail(), $errors);
            Log::error('Failed to create card on file', ['errors' => $errorMessages]);

            throw new \RuntimeException('Failed to save card: '.($errorMessages[0] ?? 'Unknown error'));
        }

        $cardId = $card->getId();

        Log::info('Created card on file', [
            'square_customer_id' => $squareCustomerId,
            'card_id' => $cardId,
        ]);

        return $cardId;
    }

    /**
     * Create a Square subscription for a single agent.
     * Uses the generic monthly plan with priceOverrideMoney.
     */
    public function createSubscription(
        string $squareCustomerId,
        string $cardId,
        int $amountCents,
        string $idempotencyKey,
    ): CreateSubscriptionResponse {
        $response = $this->squareClient->subscriptions->create(
            new CreateSubscriptionRequest([
                'locationId' => config('square.location_id'),
                'customerId' => $squareCustomerId,
                'planVariationId' => config('square.monthly_plan_variation_id'),
                'cardId' => $cardId,
                'idempotencyKey' => $idempotencyKey,
                'priceOverrideMoney' => new Money([
                    'amount' => $amountCents,
                    'currency' => 'USD',
                ]),
            ]),
        );

        $subscription = $response->getSubscription();
        if (! $subscription) {
            $errors = $response->getErrors() ?? [];
            $errorMessages = array_map(fn ($e) => $e->getDetail(), $errors);
            Log::error('Failed to create Square subscription', [
                'errors' => $errorMessages,
                'customer_id' => $squareCustomerId,
                'amount_cents' => $amountCents,
            ]);

            throw new \RuntimeException('Failed to create subscription: '.($errorMessages[0] ?? 'Unknown error'));
        }

        Log::info('Created Square subscription', [
            'subscription_id' => $subscription->getId(),
            'customer_id' => $squareCustomerId,
            'amount_cents' => $amountCents,
        ]);

        return $response;
    }

    /**
     * Cancel a Square subscription (schedules cancellation at end of billing period).
     */
    public function cancelSubscription(string $squareSubscriptionId): CancelSubscriptionResponse
    {
        $response = $this->squareClient->subscriptions->cancel(
            new CancelSubscriptionsRequest([
                'subscriptionId' => $squareSubscriptionId,
            ]),
        );

        Log::info('Cancelled Square subscription', [
            'subscription_id' => $squareSubscriptionId,
        ]);

        return $response;
    }

    /**
     * Process a one-time payment.
     * Supports both sourceId (card nonce) and cardId (card on file) as the source.
     */
    public function processOneTimePayment(
        string $sourceId,
        int $amountCents,
        string $currency,
        string $idempotencyKey,
        string $buyerEmail,
    ): Payment {
        $response = $this->squareClient->payments->create(
            new CreatePaymentRequest([
                'sourceId' => $sourceId,
                'idempotencyKey' => $idempotencyKey,
                'amountMoney' => new Money([
                    'amount' => $amountCents,
                    'currency' => $currency,
                ]),
                'locationId' => config('square.location_id'),
                'note' => 'Cynergists Order',
                'buyerEmailAddress' => $buyerEmail,
            ]),
        );

        $payment = $response->getPayment();
        if (! $payment) {
            $errors = $response->getErrors() ?? [];
            $errorMessages = array_map(fn ($e) => $e->getDetail(), $errors);
            Log::error('Square payment failed', [
                'errors' => $errorMessages,
                'email' => $buyerEmail,
            ]);

            throw new \RuntimeException('Payment failed: '.($errorMessages[0] ?? 'Unknown error'));
        }

        return $payment;
    }
}
