<?php

namespace App\Services\Specter;

use App\Models\PortalTenant;
use App\Models\SpecterEvent;
use App\Models\SpecterSession;
use App\Models\SpecterVisitor;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

class SpecterIngestService
{
    public function __construct(
        private SpecterBotFilterService $botFilterService,
        private SpecterIntentScoringService $intentScoringService,
        private SpecterIdentityResolutionService $identityResolutionService,
        private SpecterGhlSyncService $ghlSyncService,
        private SpecterWorkflowTriggerService $workflowTriggerService,
        private SpecterEscalationService $escalationService
    ) {}

    /**
     * @param  array<string,mixed>  $payload
     * @return array<string,mixed>
     */
    public function ingest(PortalTenant $tenant, array $payload, ?Request $request = null): array
    {
        $started = microtime(true);
        $visitorId = (string) $payload['visitor_id'];
        $sessionId = (string) $payload['session_id'];
        $consentState = (string) ($payload['consent_state'] ?? 'unknown');
        $consentVersion = $payload['consent_version'] ?? null;
        $dnt = (bool) ($payload['dnt'] ?? false);
        $cookieIds = array_values(array_filter((array) ($payload['cookie_ids'] ?? []), 'is_string'));
        $events = is_array($payload['events'] ?? null) ? $payload['events'] : [];
        $requestUserAgent = $request?->userAgent();
        $ip = $request?->ip();

        $visitor = SpecterVisitor::query()->firstOrCreate(
            ['tenant_id' => $tenant->id, 'visitor_id' => $visitorId],
            [
                'cookie_ids' => [],
                'first_seen_at' => now(),
                'metadata' => [],
            ]
        );

        $visitor->update([
            'cookie_ids' => array_values(array_unique(array_merge($visitor->cookie_ids ?? [], $cookieIds))),
            'consent_state' => $consentState,
            'consent_version' => is_string($consentVersion) ? $consentVersion : null,
            'dnt' => $dnt,
            'last_seen_at' => now(),
        ]);

        $session = SpecterSession::query()->firstOrCreate(
            ['tenant_id' => $tenant->id, 'session_id' => $sessionId],
            [
                'specter_visitor_id' => $visitor->id,
                'started_at' => now(),
                'metrics' => [],
                'ip_hash' => $ip ? hash('sha256', $ip) : null,
            ]
        );

        if ($session->specter_visitor_id !== $visitor->id) {
            $session->update(['specter_visitor_id' => $visitor->id]);
        }

        $sensitiveSignals = [];
        $persistedCount = 0;
        $botEventCount = 0;

        foreach ($events as $event) {
            if (! is_array($event)) {
                continue;
            }

            $eventType = (string) ($event['type'] ?? 'unknown');
            $metadata = is_array($event['metadata'] ?? null) ? $event['metadata'] : [];
            $userAgent = (string) ($event['user_agent'] ?? $requestUserAgent ?? '');
            $isBot = $this->botFilterService->isBot($userAgent, $event);

            if ($isBot) {
                $botEventCount++;
            }

            $capturedSignals = $this->extractSensitiveSignals($metadata);
            $sensitiveSignals = array_merge($sensitiveSignals, array_filter($capturedSignals, fn ($v) => $v !== null && $v !== ''));

            $sanitizedMetadata = $this->sanitizeMetadata($metadata);

            SpecterEvent::query()->create([
                'tenant_id' => $tenant->id,
                'specter_session_id' => $session->id,
                'event_id' => isset($event['event_id']) ? (string) $event['event_id'] : null,
                'type' => $eventType,
                'page_url' => isset($event['page_url']) ? (string) $event['page_url'] : null,
                'occurred_at' => ! empty($event['timestamp']) ? Carbon::parse((string) $event['timestamp']) : now(),
                'metadata' => $sanitizedMetadata,
                'is_bot' => $isBot,
            ]);

            $persistedCount++;
        }

        $session->load('events', 'visitor');

        $pageView = $session->events->where('type', 'page_view')->last();
        $latestEvent = $session->events->sortBy('occurred_at')->last();
        $metrics = $session->metrics ?? [];
        $metrics['bot_events_filtered'] = $botEventCount;
        $metrics['event_count'] = $session->events->count();
        $metrics['processing_seconds'] = round(microtime(true) - $started, 4);

        $session->update([
            'last_page_url' => $pageView?->page_url ?? $session->last_page_url,
            'referrer' => (string) ($pageView?->metadata['referrer'] ?? $session->referrer ?? ''),
            'utm_params' => $pageView?->metadata['utm'] ?? $session->utm_params,
            'device_type' => (string) ($pageView?->metadata['device_type'] ?? $session->device_type ?? ''),
            'ended_at' => $latestEvent?->occurred_at ?? $session->ended_at,
            'metrics' => $metrics,
        ]);

        $score = $this->intentScoringService->scoreSession($session, $tenant);
        $resolution = $this->identityResolutionService->resolve($session, $tenant, $sensitiveSignals, $request);

        if (($resolution['consent_allowed'] ?? false) === false) {
            $this->escalationService->escalate(
                tenant: $tenant,
                session: $session->fresh('visitor'),
                reasonCode: SpecterEscalationService::REASON_CONSENT_RESTRICTED,
                reason: 'Identity resolution unavailable because consent is missing, restricted, or DNT is enabled.',
                details: [
                    'consent_state' => $visitor->consent_state,
                    'consent_version' => $visitor->consent_version,
                    'dnt' => $visitor->dnt,
                ],
                integration: 'haven'
            );
        }

        $crm = $this->ghlSyncService->syncSession($tenant, $session->fresh('visitor'), $resolution);
        if (($crm['success'] ?? false) === false) {
            $this->escalationService->escalate(
                tenant: $tenant,
                session: $session->fresh('visitor'),
                reasonCode: SpecterEscalationService::REASON_PROVIDER_FAILURE,
                reason: 'CRM API sync failed for Specter session.',
                details: $crm,
                integration: 'gohighlevel',
                provider: 'gohighlevel'
            );
        }

        $triggerPayload = $this->workflowTriggerService->triggerHighIntentWorkflow($tenant, $session->fresh('visitor'));

        return [
            'visitor_id' => $visitor->visitor_id,
            'session_id' => $session->session_id,
            'events_received' => count($events),
            'events_persisted' => $persistedCount,
            'bot_events_filtered' => $botEventCount,
            'intent_score' => $score['intent_score'],
            'intent_tier' => $score['intent_tier'],
            'heat_zone' => $score['heat_zone'],
            'resolution_status' => $resolution['resolution_status'],
            'resolution_confidence' => $resolution['resolution_confidence'],
            'resolution_source' => $resolution['resolution_source'],
            'triggered_workflow' => $triggerPayload,
        ];
    }

    /**
     * @param  array<string,mixed>  $metadata
     * @return array<string,mixed>
     */
    private function sanitizeMetadata(array $metadata): array
    {
        $sensitiveFields = ['email', 'phone', 'name', 'first_name', 'last_name'];

        foreach ($sensitiveFields as $field) {
            if (! empty($metadata[$field]) && is_string($metadata[$field])) {
                $metadata[$field.'_hash'] = hash('sha256', strtolower(trim($metadata[$field])));
                unset($metadata[$field]);
            }
        }

        if (! empty($metadata['form_fields']) && is_array($metadata['form_fields'])) {
            foreach ($metadata['form_fields'] as $key => $value) {
                if (! is_string($value)) {
                    continue;
                }

                if (in_array(strtolower((string) $key), ['email', 'phone', 'name', 'first_name', 'last_name'], true)) {
                    $metadata['form_fields'][$key.'_hash'] = hash('sha256', strtolower(trim($value)));
                    unset($metadata['form_fields'][$key]);
                }
            }
        }

        return $metadata;
    }

    /**
     * @param  array<string,mixed>  $metadata
     * @return array<string,mixed>
     */
    private function extractSensitiveSignals(array $metadata): array
    {
        $signals = [
            'email' => null,
            'phone' => null,
            'name' => null,
            'authenticated_user_id' => Arr::get($metadata, 'authenticated_user_id'),
            'reverse_ip_company' => is_array(Arr::get($metadata, 'reverse_ip_company'))
                ? Arr::get($metadata, 'reverse_ip_company')
                : null,
        ];

        foreach (['email', 'phone', 'name'] as $field) {
            if (! empty($metadata[$field]) && is_string($metadata[$field])) {
                $signals[$field] = trim($metadata[$field]);
            } elseif (! empty($metadata['form_fields'][$field]) && is_string($metadata['form_fields'][$field])) {
                $signals[$field] = trim($metadata['form_fields'][$field]);
            }
        }

        return $signals;
    }
}
