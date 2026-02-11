<?php

namespace App\Services;

use App\Models\PortalTenant;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GoHighLevelService
{
    private ?string $apiKey;

    private ?string $locationId;

    public function __construct(?string $apiKey = null, ?string $locationId = null)
    {
        $this->apiKey = $apiKey ?? config('services.gohighlevel.api_key');
        $this->locationId = $locationId ?? config('services.gohighlevel.location_id');
    }

    /**
     * Create or update a contact in GoHighLevel.
     *
     * @return string|null The GHL contact ID, or null if not configured/failed
     */
    public function createOrUpdateContact(PortalTenant $tenant, User $user): ?string
    {
        if (! $this->isConfigured()) {
            Log::info('GoHighLevel integration not yet configured — skipping CRM sync', [
                'tenant_id' => $tenant->id,
            ]);

            return null;
        }

        $settings = $tenant->settings ?? [];

        $payload = [
            'locationId' => $this->locationId,
            'email' => $user->email,
            'name' => $user->name,
            'companyName' => $tenant->company_name,
            'website' => $settings['website'] ?? null,
            'customFields' => array_filter([
                'industry' => $settings['industry'] ?? null,
                'business_description' => $settings['business_description'] ?? null,
                'services_needed' => $settings['services_needed'] ?? null,
                'brand_tone' => $settings['brand_tone'] ?? null,
                'brand_colors' => $settings['brand_colors'] ?? null,
            ]),
        ];

        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->apiKey}",
                'Version' => '2021-07-28',
            ])->post('https://services.leadconnectorhq.com/contacts/', $payload);

            if ($response->successful()) {
                $contactId = $response->json('contact.id');

                Log::info('GoHighLevel contact synced', [
                    'tenant_id' => $tenant->id,
                    'contact_id' => $contactId,
                ]);

                return $contactId;
            }

            Log::error('GoHighLevel sync failed', [
                'tenant_id' => $tenant->id,
                'status' => $response->status(),
                'response' => $response->json(),
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('GoHighLevel sync exception', [
                'tenant_id' => $tenant->id,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Check if GoHighLevel API is configured.
     */
    public function isConfigured(): bool
    {
        return ! empty($this->apiKey) && ! empty($this->locationId);
    }
}
