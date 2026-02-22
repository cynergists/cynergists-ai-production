<?php

namespace App\Services\Specter;

use App\Models\PortalTenant;
use App\Models\SpecterSession;
use App\Models\SpecterTriggerLog;

class SpecterWorkflowTriggerService
{
    /**
     * @return array<string, mixed>|null
     */
    public function triggerHighIntentWorkflow(PortalTenant $tenant, SpecterSession $session): ?array
    {
        if (! in_array($session->intent_tier, ['medium', 'high'], true)) {
            return null;
        }

        $topSignals = collect($session->scoring_feature_breakdown ?? [])
            ->sortByDesc(fn ($row) => (float) ($row['points'] ?? 0))
            ->take(3)
            ->keys()
            ->values()
            ->all();

        $payload = [
            'session_id' => $session->session_id,
            'visitor_id' => $session->visitor?->visitor_id,
            'intent_tier' => $session->intent_tier,
            'top_signals' => $topSignals,
            'resolution_confidence' => (float) ($session->resolution_confidence ?? 0),
            'heat_zone' => $session->heat_zone,
            'source' => 'Specter',
        ];

        SpecterTriggerLog::query()->create([
            'tenant_id' => $tenant->id,
            'specter_session_id' => $session->id,
            'workflow_slug' => 'high-intent-visitor',
            'payload' => $payload,
            'status' => 'queued',
        ]);

        return $payload;
    }
}
