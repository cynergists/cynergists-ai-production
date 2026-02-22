<?php

namespace App\Services\Specter;

use App\Models\PortalTenant;
use App\Models\SpecterCrmSyncLog;
use App\Models\SpecterSession;
use Illuminate\Support\Facades\Http;

class SpecterGhlSyncService
{
    /**
     * @param  array<string,mixed>  $resolution
     * @return array<string,mixed>
     */
    public function syncSession(PortalTenant $tenant, SpecterSession $session, array $resolution): array
    {
        $apiKey = config('services.gohighlevel.api_key');
        $locationId = (string) (($tenant->settings['specter_data']['ghl_location_id'] ?? config('services.gohighlevel.location_id')) ?: '');

        if (! $apiKey || ! $locationId) {
            return $this->logFailure($tenant, $session, 'event', 'create', 'not_configured', 'GoHighLevel is not configured for Specter');
        }

        if (($resolution['resolved'] ?? false) === true && is_array($resolution['contact'] ?? null)) {
            return $this->syncResolvedContact($tenant, $session, $resolution, $apiKey, $locationId);
        }

        return $this->logEventOnly($tenant, $session);
    }

    /**
     * @param  array<string,mixed>  $resolution
     */
    private function syncResolvedContact(PortalTenant $tenant, SpecterSession $session, array $resolution, string $apiKey, string $locationId): array
    {
        $contact = $resolution['contact'];
        $dedupeKeys = [
            'email' => $contact['email'] ?? null,
            'phone' => $contact['phone'] ?? null,
            'authenticated_user_id' => $contact['authenticated_user_id'] ?? null,
            'visitor_id' => $session->visitor?->visitor_id,
        ];
        $matchingStrategy = collect(['email', 'phone', 'authenticated_user_id', 'visitor_id'])
            ->first(fn ($key) => ! empty($dedupeKeys[$key])) ?? 'visitor_id';

        $payload = array_filter([
            'locationId' => $locationId,
            'email' => $contact['email'] ?? null,
            'phone' => $contact['phone'] ?? null,
            'name' => $contact['name'] ?? null,
            'companyName' => $resolution['company']['company_name'] ?? $session->company_name,
            'tags' => [
                'source:Specter',
                'heat-zone:'.$session->heat_zone,
                'intent-tier:'.$session->intent_tier,
            ],
            'customFields' => [
                'specter_intent_score' => $session->intent_score,
                'specter_resolution_confidence' => (float) ($session->resolution_confidence ?? 0),
                'specter_last_seen_at' => optional($session->ended_at ?? $session->updated_at)->toIso8601String(),
                'specter_key_page_touches' => (int) (($session->metrics['feature_snapshot']['key_page_visits'] ?? 0)),
            ],
        ], fn ($value) => $value !== null);

        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$apiKey}",
                'Version' => '2021-07-28',
            ])->post('https://services.leadconnectorhq.com/contacts/', $payload);

            if (! $response->successful()) {
                return $this->logFailure(
                    $tenant,
                    $session,
                    'contact',
                    'upsert',
                    'ghl_http_error',
                    'GoHighLevel contact upsert failed',
                    [
                        'status' => $response->status(),
                        'matching_strategy' => $matchingStrategy,
                    ]
                );
            }

            $contactId = (string) ($response->json('contact.id') ?? '');

            SpecterCrmSyncLog::query()->create([
                'tenant_id' => $tenant->id,
                'specter_session_id' => $session->id,
                'crm_object_type' => 'contact',
                'crm_object_id' => $contactId !== '' ? $contactId : null,
                'operation' => 'upsert',
                'status' => 'success',
                'payload_summary' => [
                    'matching_strategy' => $matchingStrategy,
                    'intent_score' => $session->intent_score,
                    'intent_tier' => $session->intent_tier,
                    'heat_zone' => $session->heat_zone,
                ],
            ]);

            return [
                'success' => true,
                'crm_object_type' => 'contact',
                'crm_object_id' => $contactId,
                'matching_strategy' => $matchingStrategy,
            ];
        } catch (\Throwable $e) {
            return $this->logFailure(
                $tenant,
                $session,
                'contact',
                'upsert',
                'ghl_exception',
                $e->getMessage(),
                ['matching_strategy' => $matchingStrategy]
            );
        }
    }

    private function logEventOnly(PortalTenant $tenant, SpecterSession $session): array
    {
        SpecterCrmSyncLog::query()->create([
            'tenant_id' => $tenant->id,
            'specter_session_id' => $session->id,
            'crm_object_type' => 'event',
            'crm_object_id' => null,
            'operation' => 'create',
            'status' => 'success',
            'payload_summary' => [
                'source' => 'Specter',
                'mode' => 'unresolved_non_pii_session_event',
                'session_id' => $session->session_id,
                'visitor_id' => $session->visitor?->visitor_id,
                'intent_score' => $session->intent_score,
                'intent_tier' => $session->intent_tier,
                'resolution_status' => $session->resolution_status,
            ],
        ]);

        return [
            'success' => true,
            'crm_object_type' => 'event',
            'crm_object_id' => null,
        ];
    }

    /**
     * @param  array<string,mixed>  $extra
     * @return array<string,mixed>
     */
    private function logFailure(
        PortalTenant $tenant,
        SpecterSession $session,
        string $objectType,
        string $operation,
        string $errorCode,
        string $message,
        array $extra = []
    ): array {
        SpecterCrmSyncLog::query()->create([
            'tenant_id' => $tenant->id,
            'specter_session_id' => $session->id,
            'crm_object_type' => $objectType,
            'operation' => $operation,
            'status' => 'fail',
            'error_code' => $errorCode,
            'error_message' => $message,
            'payload_summary' => $extra,
        ]);

        return [
            'success' => false,
            'error_code' => $errorCode,
            'error_message' => $message,
        ];
    }
}
