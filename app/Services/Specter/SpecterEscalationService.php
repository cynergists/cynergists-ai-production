<?php

namespace App\Services\Specter;

use App\Models\PortalTenant;
use App\Models\SpecterEscalationLog;
use App\Models\SpecterSession;
use Illuminate\Support\Facades\Log;

class SpecterEscalationService
{
    public const REASON_CONSENT_RESTRICTED = 'consent_restricted';
    public const REASON_NON_APPROVED_SOURCE = 'non_approved_source';
    public const REASON_PROVIDER_FAILURE = 'provider_failure';
    public const REASON_COMPLIANCE_BYPASS_ATTEMPT = 'compliance_bypass_attempt';
    public const REASON_IDENTITY_UNAVAILABLE = 'identity_unavailable';

    /**
     * @param  array<string, mixed>  $details
     */
    public function escalate(
        PortalTenant $tenant,
        ?SpecterSession $session,
        string $reasonCode,
        string $reason,
        array $details = [],
        ?string $integration = 'haven',
        ?string $provider = null
    ): SpecterEscalationLog {
        $payload = array_merge($details, [
            'reason' => $reason,
            'session_id' => $session?->session_id,
            'visitor_id' => $session?->visitor?->visitor_id,
        ]);

        $log = SpecterEscalationLog::query()->create([
            'tenant_id' => $tenant->id,
            'specter_session_id' => $session?->id,
            'visitor_id' => $session?->visitor?->visitor_id,
            'reason_code' => $reasonCode,
            'details' => $payload,
            'integration' => $integration,
            'provider' => $provider,
        ]);

        Log::warning('Specter escalation logged', [
            'tenant_id' => $tenant->id,
            'specter_session_id' => $session?->id,
            'reason_code' => $reasonCode,
            'integration' => $integration,
            'provider' => $provider,
        ]);

        return $log;
    }
}
