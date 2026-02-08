<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProcessPaymentRequest;
use App\Models\PortalTenant;
use App\Models\User;
use App\Services\AgentAttachmentService;
use App\Services\SquareSubscriptionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    public function __construct(
        private SquareSubscriptionService $squareService,
    ) {}

    /**
     * Get Square configuration for the frontend.
     */
    public function getConfig(): JsonResponse
    {
        return response()->json([
            'applicationId' => config('square.application_id'),
            'locationId' => config('square.location_id'),
            'environment' => config('square.environment'),
        ]);
    }

    /**
     * Process a payment that may contain both subscription and one-time items.
     */
    public function processPayment(ProcessPaymentRequest $request): JsonResponse
    {
        $validated = $request->validated();

        try {
            $user = User::query()->where('email', $validated['customer_email'])->first();

            if (! $user) {
                Log::warning('Payment attempted but user not found', [
                    'customer_email' => $validated['customer_email'],
                ]);

                return response()->json([
                    'success' => false,
                    'error' => 'User account not found. Please register first.',
                ], 422);
            }

            $cartItems = $validated['cart_items'];
            $monthlyItems = array_filter($cartItems, fn ($item) => $item['billing_type'] === 'monthly');
            $oneTimeItems = array_filter($cartItems, fn ($item) => $item['billing_type'] === 'one_time');

            $hasMonthly = count($monthlyItems) > 0;
            $hasOneTime = count($oneTimeItems) > 0;

            /** @var array<array{name: string, billing_type: string, square_subscription_id: ?string, square_card_id: ?string, payment_id: ?string}> */
            $agentSubscriptionData = [];
            $paymentId = null;
            $receiptUrl = null;
            $cardId = null;

            if ($hasMonthly) {
                // Get or create tenant for subscription management
                $tenant = PortalTenant::forUser($user);
                if (! $tenant) {
                    $attachmentService = app(AgentAttachmentService::class);
                    $attachmentService->attachAgentsToUser($user->email, []);
                    $tenant = PortalTenant::forUser($user);
                }

                // Create Square Customer if needed
                $squareCustomerId = $this->squareService->getOrCreateSquareCustomer($tenant, $user);

                // Create Card on File (consumes the token)
                $cardId = $this->squareService->createCardOnFile($squareCustomerId, $validated['source_id']);

                // Create a subscription for each monthly agent
                foreach ($monthlyItems as $item) {
                    $subscriptionResponse = $this->squareService->createSubscription(
                        $squareCustomerId,
                        $cardId,
                        $item['price'] * $item['quantity'],
                        (string) Str::uuid(),
                    );

                    $subscription = $subscriptionResponse->getSubscription();
                    $agentSubscriptionData[] = [
                        'name' => $item['name'],
                        'billing_type' => 'monthly',
                        'square_subscription_id' => $subscription?->getId(),
                        'square_card_id' => $cardId,
                        'payment_id' => null,
                    ];
                }

                // Process one-time items using the card on file
                if ($hasOneTime) {
                    $oneTimeTotal = array_reduce(
                        $oneTimeItems,
                        fn ($sum, $item) => $sum + ($item['price'] * $item['quantity']),
                        0,
                    );

                    $payment = $this->squareService->processOneTimePayment(
                        $cardId,
                        $oneTimeTotal,
                        $validated['currency'],
                        (string) Str::uuid(),
                        $validated['customer_email'],
                    );

                    $paymentId = $payment->getId();
                    $receiptUrl = $payment->getReceiptUrl();

                    foreach ($oneTimeItems as $item) {
                        $agentSubscriptionData[] = [
                            'name' => $item['name'],
                            'billing_type' => 'one_time',
                            'square_subscription_id' => null,
                            'square_card_id' => null,
                            'payment_id' => $paymentId,
                        ];
                    }
                }
            } else {
                // Only one-time items — use sourceId directly (existing flow)
                $oneTimeTotal = array_reduce(
                    $oneTimeItems,
                    fn ($sum, $item) => $sum + ($item['price'] * $item['quantity']),
                    0,
                );

                $payment = $this->squareService->processOneTimePayment(
                    $validated['source_id'],
                    $oneTimeTotal,
                    $validated['currency'],
                    $validated['idempotency_key'],
                    $validated['customer_email'],
                );

                $paymentId = $payment->getId();
                $receiptUrl = $payment->getReceiptUrl();

                foreach ($oneTimeItems as $item) {
                    $agentSubscriptionData[] = [
                        'name' => $item['name'],
                        'billing_type' => 'one_time',
                        'square_subscription_id' => null,
                        'square_card_id' => null,
                        'payment_id' => $paymentId,
                    ];
                }
            }

            // Attach agents to user with per-agent subscription data
            $allAgentNames = array_map(fn ($item) => $item['name'], $cartItems);
            $attachmentService = app(AgentAttachmentService::class);
            $result = $attachmentService->attachAgentsToUser(
                $user->email,
                $allAgentNames,
                agentSubscriptionData: $agentSubscriptionData,
            );

            Log::info('Payment processed successfully', [
                'user_email' => $validated['customer_email'],
                'payment_id' => $paymentId,
                'monthly_count' => count($monthlyItems),
                'one_time_count' => count($oneTimeItems),
                'agents_attached' => $result['agents_attached'] ?? 0,
            ]);

            return response()->json([
                'success' => true,
                'payment_id' => $paymentId,
                'status' => 'COMPLETED',
                'receipt_url' => $receiptUrl,
            ]);
        } catch (\Square\Exceptions\SquareApiException $e) {
            $errors = $e->getErrors() ?? [];
            $errorMessages = array_map(fn ($error) => $error->getDetail(), $errors);

            Log::error('Square API exception', [
                'message' => $e->getMessage(),
                'errors' => $errorMessages,
                'customer_email' => $validated['customer_email'] ?? 'unknown',
            ]);

            return response()->json([
                'success' => false,
                'error' => $errorMessages[0] ?? 'Payment processing failed. Please try again.',
            ], 422);
        } catch (\Exception $e) {
            Log::error('Payment exception', [
                'message' => $e->getMessage(),
                'customer_email' => $validated['customer_email'] ?? 'unknown',
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Payment processing failed. Please try again.',
            ], 500);
        }
    }
}
