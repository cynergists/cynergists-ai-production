<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AgentAccess;
use App\Models\CustomerSubscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SquareWebhookController extends Controller
{
    /**
     * Handle incoming Square webhook events.
     */
    public function handle(Request $request): JsonResponse
    {
        if (! $this->verifySignature($request)) {
            Log::warning('Square webhook signature verification failed');

            return response()->json(['error' => 'Invalid signature'], 403);
        }

        $payload = $request->json()->all();
        $eventType = $payload['type'] ?? null;

        Log::info('Square webhook received', ['type' => $eventType]);

        if ($eventType === 'subscription.updated') {
            $this->handleSubscriptionUpdated($payload);
        }

        return response()->json(['success' => true]);
    }

    /**
     * Verify the Square webhook signature.
     */
    private function verifySignature(Request $request): bool
    {
        $sigKey = config('square.webhook_signature_key');
        if (! $sigKey) {
            return false;
        }

        $signature = $request->header('x-square-hmacsha256-signature');
        if (! $signature) {
            return false;
        }

        $body = $request->getContent();
        $webhookUrl = config('app.url').'/api/webhooks/square';
        $expectedSignature = base64_encode(hash_hmac('sha256', $webhookUrl.$body, $sigKey, true));

        return hash_equals($expectedSignature, $signature);
    }

    /**
     * Handle subscription.updated events.
     * Maps Square subscription status to local subscription and agent access.
     *
     * @param  array<string, mixed>  $payload
     */
    private function handleSubscriptionUpdated(array $payload): void
    {
        $subscriptionData = $payload['data']['object']['subscription'] ?? null;
        if (! $subscriptionData) {
            return;
        }

        $squareSubscriptionId = $subscriptionData['id'] ?? null;
        $squareStatus = $subscriptionData['status'] ?? null;

        if (! $squareSubscriptionId || ! $squareStatus) {
            return;
        }

        $subscription = CustomerSubscription::query()
            ->where('square_subscription_id', $squareSubscriptionId)
            ->first();

        if (! $subscription) {
            Log::warning('Square webhook: subscription not found', [
                'square_subscription_id' => $squareSubscriptionId,
            ]);

            return;
        }

        $statusMap = [
            'ACTIVE' => 'active',
            'CANCELED' => 'canceled',
            'DEACTIVATED' => 'deactivated',
            'PAUSED' => 'paused',
            'PENDING' => 'pending',
        ];

        $localStatus = $statusMap[$squareStatus] ?? $subscription->status;
        $subscription->status = $localStatus;
        $subscription->save();

        Log::info('Square subscription status synced', [
            'square_subscription_id' => $squareSubscriptionId,
            'square_status' => $squareStatus,
            'local_status' => $localStatus,
        ]);

        // If the subscription is canceled or deactivated, deactivate agent access
        if (in_array($squareStatus, ['CANCELED', 'DEACTIVATED'])) {
            AgentAccess::query()
                ->where('subscription_id', $subscription->id)
                ->where('is_active', true)
                ->update(['is_active' => false]);

            Log::info('Agent access deactivated via webhook', [
                'subscription_id' => $subscription->id,
                'square_status' => $squareStatus,
            ]);
        }
    }
}
