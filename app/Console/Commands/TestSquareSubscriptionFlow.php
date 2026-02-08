<?php

namespace App\Console\Commands;

use App\Services\SquareSubscriptionService;
use Illuminate\Console\Command;
use Illuminate\Support\Str;
use Square\Environments;
use Square\SquareClient;

class TestSquareSubscriptionFlow extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:test-square-subscription-flow
                            {--cancel : Also test cancelling the subscription after creation}
                            {--cleanup : Cancel and clean up the subscription at the end}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test the full Square subscription flow in sandbox: create customer, card on file, subscription';

    /**
     * Execute the console command.
     */
    public function handle(SquareSubscriptionService $service): int
    {
        $env = config('square.environment');
        if ($env === 'production') {
            $this->error('This command should only be run in sandbox mode. Set SQUARE_ENVIRONMENT=sandbox in .env.');

            return self::FAILURE;
        }

        $this->info("Testing Square subscription flow ({$env} environment)");
        $this->newLine();

        // Verify config
        $this->components->info('Step 0: Verify configuration');
        $required = ['square.access_token', 'square.location_id', 'square.monthly_plan_variation_id'];
        foreach ($required as $key) {
            if (! config($key)) {
                $this->error("Missing config: {$key}");

                return self::FAILURE;
            }
            $this->line("  {$key} ... OK");
        }

        // Step 1: Create a test Square customer
        $this->newLine();
        $this->components->info('Step 1: Create Square customer');
        try {
            $baseUrl = config('square.environment') === 'production'
                ? Environments::Production->value
                : Environments::Sandbox->value;

            $client = new SquareClient(
                token: config('square.access_token'),
                options: ['baseUrl' => $baseUrl],
            );

            $response = $client->customers->create(
                new \Square\Customers\Requests\CreateCustomerRequest([
                    'idempotencyKey' => (string) Str::uuid(),
                    'givenName' => 'Test',
                    'familyName' => 'User',
                    'emailAddress' => 'test-'.Str::random(8).'@cynergists.ai',
                    'companyName' => 'Cynergists Test',
                    'referenceId' => 'test-'.Str::random(8),
                ]),
            );

            $customer = $response->getCustomer();
            if (! $customer) {
                $this->error('Failed to create customer');

                return self::FAILURE;
            }

            $customerId = $customer->getId();
            $this->line("  Customer ID: {$customerId}");
        } catch (\Exception $e) {
            $this->error("Failed: {$e->getMessage()}");

            return self::FAILURE;
        }

        // Step 2: Create a Card on File using sandbox test nonce
        $this->newLine();
        $this->components->info('Step 2: Create card on file (sandbox nonce: cnon:card-nonce-ok)');
        try {
            $cardId = $service->createCardOnFile($customerId, 'cnon:card-nonce-ok');
            $this->line("  Card ID: {$cardId}");
        } catch (\Exception $e) {
            $this->error("Failed: {$e->getMessage()}");

            return self::FAILURE;
        }

        // Step 3: Create a subscription
        $this->newLine();
        $this->components->info('Step 3: Create subscription ($49.99/month)');
        try {
            $response = $service->createSubscription(
                squareCustomerId: $customerId,
                cardId: $cardId,
                amountCents: 4999,
                idempotencyKey: (string) Str::uuid(),
            );

            $subscription = $response->getSubscription();
            $subscriptionId = $subscription->getId();
            $status = $subscription->getStatus();

            $this->line("  Subscription ID: {$subscriptionId}");
            $this->line("  Status: {$status}");
        } catch (\Exception $e) {
            $this->error("Failed: {$e->getMessage()}");

            return self::FAILURE;
        }

        // Step 4 (optional): Test cancellation
        if ($this->option('cancel') || $this->option('cleanup')) {
            $this->newLine();
            $this->components->info('Step 4: Cancel subscription');
            try {
                $response = $service->cancelSubscription($subscriptionId);
                $sub = $response->getSubscription();
                $cancelStatus = $sub?->getStatus();
                $this->line("  Status after cancel: {$cancelStatus}");
            } catch (\Exception $e) {
                $this->error("Cancel failed: {$e->getMessage()}");

                return self::FAILURE;
            }
        }

        // Summary
        $this->newLine();
        $this->components->info('All steps completed successfully!');
        $this->table(
            ['Resource', 'ID'],
            [
                ['Customer', $customerId],
                ['Card', $cardId],
                ['Subscription', $subscriptionId],
            ],
        );

        if (! $this->option('cancel') && ! $this->option('cleanup')) {
            $this->newLine();
            $this->warn('Note: A sandbox subscription was created and is still active.');
            $this->warn('Run with --cleanup to cancel it, or cancel manually in Square Dashboard.');
        }

        return self::SUCCESS;
    }
}
