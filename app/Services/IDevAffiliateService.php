<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class IDevAffiliateService
{
    public function __construct(
        private ?string $secret = null,
        private ?string $profile = null,
        private ?string $url = null,
        private bool $enabled = true,
    ) {
        $this->secret = $secret ?? config('idevaffiliate.secret');
        $this->profile = $profile ?? config('idevaffiliate.profile');
        $this->url = $url ?? config('idevaffiliate.url');
        $this->enabled = $enabled && config('idevaffiliate.enabled', false);
    }

    /**
     * Report a sale to iDevAffiliate for commission tracking.
     *
     * Never throws — errors are logged and swallowed so checkout is never blocked.
     *
     * @param  array{sale_amount: string, order_number: string, ip_address: string, customer_name?: string, customer_email?: string, product_info?: string}  $data
     */
    public function reportSale(array $data): bool
    {
        if (! $this->isConfigured()) {
            Log::info('iDevAffiliate integration not configured — skipping commission report', [
                'order_number' => $data['order_number'] ?? 'unknown',
            ]);

            return false;
        }

        $payload = [
            'idev_secret' => $this->secret,
            'profile' => $this->profile,
            'idev_saleamt' => $data['sale_amount'],
            'idev_ordernum' => $data['order_number'],
            'ip_address' => $data['ip_address'],
            'idev_option_1' => $data['customer_name'] ?? '',
            'idev_option_2' => $data['customer_email'] ?? '',
            'idev_option_3' => $data['product_info'] ?? '',
            'idev_currency' => 'USD',
        ];

        try {
            $response = Http::timeout(5)
                ->asForm()
                ->post($this->url, $payload);

            if ($response->successful()) {
                Log::info('iDevAffiliate commission reported', [
                    'order_number' => $data['order_number'],
                    'sale_amount' => $data['sale_amount'],
                ]);

                return true;
            }

            Log::warning('iDevAffiliate commission report failed', [
                'order_number' => $data['order_number'],
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return false;
        } catch (\Exception $e) {
            Log::error('iDevAffiliate commission report exception', [
                'order_number' => $data['order_number'],
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    public function isConfigured(): bool
    {
        return $this->enabled
            && ! empty($this->secret)
            && ! empty($this->profile)
            && ! empty($this->url);
    }
}
