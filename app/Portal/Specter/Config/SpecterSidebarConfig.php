<?php

namespace App\Portal\Specter\Config;

use App\Models\PortalTenant;
use App\Models\SpecterSession;

class SpecterSidebarConfig
{
    public static function getConfig(PortalTenant $tenant): array
    {
        $specterData = $tenant->settings['specter_data'] ?? [];

        $todaySessions = SpecterSession::query()
            ->where('tenant_id', $tenant->id)
            ->whereDate('created_at', today())
            ->get();

        return [
            'metrics' => [
                'sessions_today' => $todaySessions->count(),
                'high_intent_sessions' => $todaySessions->where('intent_tier', 'high')->count(),
                'resolved_companies' => $todaySessions->filter(fn (SpecterSession $session) => ! empty($session->company_name))->count(),
                'avg_processing_seconds' => round((float) ($todaySessions->avg(fn (SpecterSession $session) => (float) ($session->metrics['processing_seconds'] ?? 0)) ?? 0), 2),
                'consent_compliant_rate' => 100,
                'resolution_rate' => $todaySessions->count() > 0
                    ? round(($todaySessions->whereIn('resolution_status', ['resolved', 'partial'])->count() / $todaySessions->count()) * 100, 1)
                    : 0,
                'avg_intent_score' => round((float) ($todaySessions->avg('intent_score') ?? 0), 1),
            ],
            'top_signals' => $specterData['top_signals'] ?? ['Pricing Viewed', 'Demo Dwell', 'Form Started'],
            'high_intent_pages' => $specterData['high_intent_pages'] ?? ['/pricing', '/demo', '/contact'],
            'tracking_mode' => $specterData['tracking_mode'] ?? 'production',
            'ghl_location_id' => $specterData['ghl_location_id'] ?? null,
        ];
    }
}
