<?php

namespace App\Services\Specter;

use App\Models\PortalTenant;
use App\Models\SpecterSession;
use Illuminate\Http\Request;

class SpecterIdentityResolutionService
{
    /**
     * @param  array<string, mixed>  $sensitiveSignals
     * @return array<string, mixed>
     */
    public function resolve(SpecterSession $session, PortalTenant $tenant, array $sensitiveSignals = [], ?Request $request = null): array
    {
        $session->loadMissing('visitor', 'events');

        $consentState = strtolower((string) ($session->visitor?->consent_state ?? 'unknown'));
        $consentAllowed = in_array($consentState, ['granted', 'full', 'analytics', 'analytics_marketing'], true)
            && ! ($session->visitor?->dnt ?? false);

        if (! $consentAllowed) {
            $result = [
                'resolution_status' => 'unresolved',
                'resolution_confidence' => 0,
                'resolution_source' => 'consent_restricted',
                'resolved' => false,
                'contact' => null,
                'company' => null,
                'consent_allowed' => false,
            ];

            $session->update([
                'resolution_status' => $result['resolution_status'],
                'resolution_confidence' => 0,
                'resolution_source' => $result['resolution_source'],
            ]);

            return $result;
        }

        $contact = null;
        $company = null;
        $confidence = 0.0;
        $source = null;

        if (! empty($sensitiveSignals['email']) || ! empty($sensitiveSignals['phone'])) {
            $contact = array_filter([
                'email' => $sensitiveSignals['email'] ?? null,
                'phone' => $sensitiveSignals['phone'] ?? null,
                'name' => $sensitiveSignals['name'] ?? null,
            ]);
            $confidence = 95;
            $source = 'first_party_form';
        } elseif (! empty($sensitiveSignals['authenticated_user_id'])) {
            $contact = [
                'authenticated_user_id' => (string) $sensitiveSignals['authenticated_user_id'],
            ];
            $confidence = 100;
            $source = 'authenticated_session';
        }

        if (! $company) {
            $company = $this->resolveCompanyByReverseIp($tenant, $request, $sensitiveSignals);
            if ($company && $confidence < 60) {
                $confidence = 55;
                $source = $source ?? 'reverse_ip_vendor';
            }
        }

        $resolved = $contact !== null || $company !== null;
        $status = $resolved ? ($contact !== null ? 'resolved' : 'partial') : 'unresolved';

        $session->update([
            'resolution_status' => $status,
            'resolution_confidence' => $confidence > 0 ? $confidence : 0,
            'resolution_source' => $source,
            'company_name' => $company['company_name'] ?? $session->company_name,
            'company_domain' => $company['company_domain'] ?? $session->company_domain,
        ]);

        return [
            'resolution_status' => $status,
            'resolution_confidence' => $confidence,
            'resolution_source' => $source,
            'resolved' => $resolved,
            'contact' => $contact,
            'company' => $company,
            'consent_allowed' => true,
        ];
    }

    /**
     * @param  array<string, mixed>  $sensitiveSignals
     * @return array<string, string>|null
     */
    private function resolveCompanyByReverseIp(PortalTenant $tenant, ?Request $request, array $sensitiveSignals): ?array
    {
        $specterData = $tenant->settings['specter_data'] ?? [];
        $provider = (string) ($specterData['reverse_ip_provider'] ?? '');
        $approvedProviders = (array) ($specterData['approved_reverse_ip_providers'] ?? ['rb2b', 'clearbit', 'default']);

        if ($provider !== '' && ! in_array($provider, $approvedProviders, true)) {
            return null;
        }

        if (! empty($sensitiveSignals['reverse_ip_company']) && is_array($sensitiveSignals['reverse_ip_company'])) {
            return [
                'company_name' => (string) ($sensitiveSignals['reverse_ip_company']['name'] ?? 'Unknown Company'),
                'company_domain' => (string) ($sensitiveSignals['reverse_ip_company']['domain'] ?? ''),
            ];
        }

        $host = $request?->header('X-Forwarded-Host') ?? $request?->getHost();
        if (! $host) {
            return null;
        }

        return null;
    }
}
