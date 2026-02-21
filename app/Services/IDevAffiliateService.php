<?php

namespace App\Services;

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
     * @param  array{
     *     sale_amount: string,
     *     order_number: string,
     *     ip_address?: string,
     *     affiliate_id?: string,
     *     email_address?: string,
     *     customer_name?: string,
     *     customer_email?: string,
     *     product_info?: string,
     *     idev_percent?: string,
     *     idev_commission?: string,
     * }  $data
     */
    public function reportSale(array $data): bool
    {
        if (! $this->isConfigured()) {
            Log::info('iDevAffiliate integration not configured — skipping commission report', [
                'order_number' => $data['order_number'] ?? 'unknown',
            ]);

            return false;
        }

        // Required fields
        $payload = [
            'idev_secret' => $this->secret,
            'profile' => $this->profile,
            'idev_saleamt' => $data['sale_amount'],
            'idev_ordernum' => $data['order_number'],
            'idev_currency' => 'USD',
        ];

        // Tracking — at least one of ip_address, affiliate_id, or email_address is required
        if (! empty($data['ip_address'])) {
            $payload['ip_address'] = $data['ip_address'];
        }

        if (! empty($data['affiliate_id'])) {
            $payload['affiliate_id'] = $data['affiliate_id'];
        }

        if (! empty($data['email_address'])) {
            $payload['email_address'] = $data['email_address'];
        }

        // Optional customer / product data
        if (! empty($data['customer_name'])) {
            $payload['idev_option_1'] = $data['customer_name'];
        }

        if (! empty($data['customer_email'])) {
            $payload['idev_option_2'] = $data['customer_email'];
        }

        if (! empty($data['product_info'])) {
            $payload['idev_option_3'] = $data['product_info'];
        }

        // Optional custom commissioning
        if (! empty($data['idev_percent'])) {
            $payload['idev_percent'] = $data['idev_percent'];
        }

        if (! empty($data['idev_commission'])) {
            $payload['idev_commission'] = $data['idev_commission'];
        }

        try {
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $this->url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($ch, CURLOPT_HEADER, 0);
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
            curl_setopt($ch, CURLOPT_TIMEOUT, 5);

            $json = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);

            if ($curlError) {
                Log::error('iDevAffiliate cURL error', [
                    'order_number' => $data['order_number'],
                    'error' => $curlError,
                ]);

                return false;
            }

            if ($httpCode >= 200 && $httpCode < 300) {
                Log::info('iDevAffiliate commission reported', [
                    'order_number' => $data['order_number'],
                    'sale_amount' => $data['sale_amount'],
                    'http_code' => $httpCode,
                ]);

                return true;
            }

            Log::warning('iDevAffiliate commission report failed', [
                'order_number' => $data['order_number'],
                'http_code' => $httpCode,
                'response' => $json,
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
