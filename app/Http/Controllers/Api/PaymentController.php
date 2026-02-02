<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AgentAttachmentService;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Square\Environments;
use Square\Payments\Requests\CreatePaymentRequest;
use Square\SquareClient;
use Square\Types\Money;

class PaymentController extends Controller
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
     * Process a Square payment.
     */
    public function processPayment(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'source_id' => ['required', 'string'],
            'amount' => ['required', 'integer', 'min:1'],
            'currency' => ['required', 'string', 'size:3'],
            'customer_email' => ['required', 'email'],
            'customer_name' => ['required', 'string'],
            'idempotency_key' => ['required', 'string'],
            'order_description' => ['nullable', 'string'],
            'cart_items' => ['nullable', 'array'],
        ]);

        try {
            $amountMoney = new Money([
                'amount' => $validated['amount'],
                'currency' => $validated['currency'],
            ]);

            $paymentRequest = new CreatePaymentRequest([
                'sourceId' => $validated['source_id'],
                'idempotencyKey' => $validated['idempotency_key'],
                'amountMoney' => $amountMoney,
                'locationId' => config('square.location_id'),
                'note' => $validated['order_description'] ?? 'Cynergists Order',
                'buyerEmailAddress' => $validated['customer_email'],
            ]);

            $response = $this->squareClient->payments->create($paymentRequest);

            $payment = $response->getPayment();

            if ($payment) {
                // Find or note the user for this purchase
                $user = User::where('email', $validated['customer_email'])->first();

                Log::info('Square payment successful', [
                    'payment_id' => $payment->getId(),
                    'customer_email' => $validated['customer_email'],
                    'amount' => $validated['amount'],
                    'user_id' => $user?->id,
                    'cart_items' => $validated['cart_items'] ?? [],
                ]);

                // Attach purchased agents to the user's portal tenant
                if ($user && ! empty($validated['cart_items'])) {
                    $purchasedAgentNames = array_map(
                        fn ($item) => $item['name'],
                        $validated['cart_items']
                    );

                    // Attach the purchased agents to the user's portal account
                    $attachmentService = app(AgentAttachmentService::class);
                    $result = $attachmentService->attachAgentsToUser(
                        $user->email,
                        $purchasedAgentNames,
                        companyName: null,
                        subdomain: null
                    );

                    if ($result['success']) {
                        Log::info('Successfully attached agents to user', [
                            'user_email' => $user->email,
                            'agent_names' => $purchasedAgentNames,
                            'agents_attached' => $result['agents_attached'],
                            'tenant_id' => $result['tenant_id'],
                        ]);
                    } else {
                        Log::error('Failed to attach agents after payment', [
                            'user_email' => $user->email,
                            'agent_names' => $purchasedAgentNames,
                            'error' => $result['message'],
                        ]);
                    }
                } elseif (! $user) {
                    Log::warning('Payment successful but user not found for agent attachment', [
                        'customer_email' => $validated['customer_email'],
                        'payment_id' => $payment->getId(),
                    ]);
                }

                return response()->json([
                    'success' => true,
                    'payment_id' => $payment->getId(),
                    'status' => $payment->getStatus(),
                    'receipt_url' => $payment->getReceiptUrl(),
                ]);
            }

            $errors = $response->getErrors() ?? [];
            $errorMessages = array_map(fn ($e) => $e->getDetail(), $errors);

            Log::error('Square payment failed', [
                'errors' => $errorMessages,
                'customer_email' => $validated['customer_email'],
            ]);

            return response()->json([
                'success' => false,
                'error' => $errorMessages[0] ?? 'Payment failed',
                'errors' => $errorMessages,
            ], 422);

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
            Log::error('Square payment exception', [
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
