<?php

namespace App\Services\Arsenal;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ArsenalLoggingService
{
    /**
     * Allowed tags as defined in Developer Decision Spec v1.0
     */
    private const ALLOWED_TAGS = [
        'catalog_cleanup',
        'content_generation',
        'image_preparation',
        'low_issue',
        'medium_issue',
        'high_risk_data',
        'critical_escalation',
    ];

    /**
     * Log session data to Go High Level CRM
     *
     * @param array $sessionData Session information
     * @return bool Success status
     */
    public function logSessionToGHL(array $sessionData): bool
    {
        try {
            // Validate required fields
            $this->validateSessionData($sessionData);

            // Build structured payload
            $payload = $this->buildGHLPayload($sessionData);

            // Get contact ID (would typically be from user profile or session)
            $contactId = $sessionData['contact_id'] ?? $this->getContactIdFromUser($sessionData['user_id']);

            if (!$contactId) {
                Log::warning('Arsenal: No contact ID found for Go High Level logging', [
                    'user_id' => $sessionData['user_id'],
                    'session_id' => $sessionData['session_id'],
                ]);
                return false;
            }

            // Make API call to Go High Level
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . config('services.ghl.api_key'),
                'Content-Type' => 'application/json',
            ])->post("https://rest.gohighlevel.com/v1/contacts/{$contactId}/notes", [
                'body' => json_encode($payload),
            ]);

            if ($response->successful()) {
                Log::info('Arsenal: Successfully logged session to Go High Level', [
                    'session_id' => $sessionData['session_id'],
                    'contact_id' => $contactId,
                ]);
                return true;
            } else {
                Log::error('Arsenal: Failed to log session to Go High Level', [
                    'session_id' => $sessionData['session_id'],
                    'response_status' => $response->status(),
                    'response_body' => $response->body(),
                ]);
                return false;
            }

        } catch (\Exception $e) {
            Log::error('Arsenal: Exception during Go High Level logging', [
                'session_id' => $sessionData['session_id'] ?? 'unknown',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return false;
        }
    }

    /**
     * Log real-time events (escalations, critical issues)
     *
     * @param array $eventData Event information
     * @return bool Success status
     */
    public function logRealTimeEvent(array $eventData): bool
    {
        try {
            // Validate event data
            if (empty($eventData['event_type']) || empty($eventData['session_id'])) {
                throw new \InvalidArgumentException('Real-time event must have event_type and session_id');
            }

            // Log locally first
            Log::info('Arsenal: Real-time event', $eventData);

            // For critical events, also attempt immediate CRM logging
            if ($eventData['severity'] === 'critical') {
                $this->logCriticalEventToGHL($eventData);
            }

            return true;

        } catch (\Exception $e) {
            Log::error('Arsenal: Exception during real-time event logging', [
                'event_data' => $eventData,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Build Go High Level API payload according to spec
     */
    private function buildGHLPayload(array $sessionData): array
    {
        return [
            'agent' => 'Arsenal',
            'session_id' => $sessionData['session_id'],
            'user_id' => $sessionData['user_id'],
            'platform_target' => $sessionData['platform_target'] ?? 'Unknown',
            'data_source_type' => $sessionData['data_source_type'] ?? 'Unknown',
            'draft_batches_created' => $sessionData['draft_batches_created'] ?? 0,
            'severity_counts' => $sessionData['severity_counts'] ?? [
                'low' => 0,
                'medium' => 0,
                'high' => 0,
                'critical' => 0,
            ],
            'tags' => $this->validateTags($sessionData['tags'] ?? []),
            'escalation' => $sessionData['escalation'] ?? false,
            'session_start' => $sessionData['session_start'] ?? now()->toISOString(),
            'session_end' => $sessionData['session_end'] ?? now()->toISOString(),
            'processing_duration_seconds' => $sessionData['processing_duration_seconds'] ?? 0,
        ];
    }

    /**
     * Validate session data has required fields
     */
    private function validateSessionData(array $sessionData): void
    {
        $required = ['session_id', 'user_id'];
        
        foreach ($required as $field) {
            if (empty($sessionData[$field])) {
                throw new \InvalidArgumentException("Session data missing required field: {$field}");
            }
        }
    }

    /**
     * Validate tags against allowed vocabulary
     */
    private function validateTags(array $tags): array
    {
        $validTags = [];
        
        foreach ($tags as $tag) {
            if (in_array($tag, self::ALLOWED_TAGS)) {
                $validTags[] = $tag;
            } else {
                Log::warning('Arsenal: Invalid tag filtered out', [
                    'invalid_tag' => $tag,
                    'allowed_tags' => self::ALLOWED_TAGS,
                ]);
            }
        }

        return $validTags;
    }

    /**
     * Get Go High Level contact ID for user
     */
    private function getContactIdFromUser(string $userId): ?string
    {
        // This would typically look up the user's GHL contact ID
        // from their profile or a mapping table
        try {
            $user = \App\Models\User::find($userId);
            if ($user && !empty($user->ghl_contact_id)) {
                return $user->ghl_contact_id;
            }

            // Fallback: try to match by email
            if ($user && !empty($user->email)) {
                return $this->findGHLContactByEmail($user->email);
            }

            return null;
            
        } catch (\Exception $e) {
            Log::error('Arsenal: Failed to get GHL contact ID', [
                'user_id' => $userId,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Find Go High Level contact by email
     */
    private function findGHLContactByEmail(string $email): ?string
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . config('services.ghl.api_key'),
            ])->get('https://rest.gohighlevel.com/v1/contacts', [
                'email' => $email,
                'limit' => 1,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                if (!empty($data['contacts'][0]['id'])) {
                    return $data['contacts'][0]['id'];
                }
            }

            return null;

        } catch (\Exception $e) {
            Log::error('Arsenal: Failed to find GHL contact by email', [
                'email' => $email,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Log critical events immediately to Go High Level
     */
    private function logCriticalEventToGHL(array $eventData): void
    {
        try {
            // Build immediate critical event payload
            $payload = [
                'agent' => 'Arsenal',
                'event_type' => 'critical_event',
                'session_id' => $eventData['session_id'],
                'user_id' => $eventData['user_id'] ?? 'unknown',
                'timestamp' => now()->toISOString(),
                'severity' => 'critical',
                'event_details' => $eventData,
                'requires_immediate_attention' => true,
            ];

            $contactId = $eventData['contact_id'] ?? $this->getContactIdFromUser($eventData['user_id'] ?? '');

            if ($contactId) {
                Http::withHeaders([
                    'Authorization' => 'Bearer ' . config('services.ghl.api_key'),
                    'Content-Type' => 'application/json',
                ])->post("https://rest.gohighlevel.com/v1/contacts/{$contactId}/notes", [
                    'body' => json_encode($payload),
                ]);
            }

        } catch (\Exception $e) {
            Log::error('Arsenal: Failed to log critical event to GHL', [
                'event_data' => $eventData,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Create session tracking data structure
     */
    public function createSessionData(string $userId, string $platformTarget = null, string $dataSourceType = null): array
    {
        return [
            'session_id' => (string) Str::uuid(),
            'user_id' => $userId,
            'platform_target' => $platformTarget,
            'data_source_type' => $dataSourceType,
            'session_start' => now()->toISOString(),
            'draft_batches_created' => 0,
            'severity_counts' => [
                'low' => 0,
                'medium' => 0,
                'high' => 0,
                'critical' => 0,
            ],
            'tags' => [],
            'escalation' => false,
            'status' => 'active',
        ];
    }

    /**
     * Mark session as completed and prepare for logging
     */
    public function completeSession(array &$sessionData): array
    {
        $sessionData['session_end'] = now()->toISOString();
        $sessionData['status'] = 'completed';
        
        if (!empty($sessionData['session_start'])) {
            $start = \Carbon\Carbon::parse($sessionData['session_start']);
            $end = \Carbon\Carbon::parse($sessionData['session_end']);
            $sessionData['processing_duration_seconds'] = $end->diffInSeconds($start);
        }

        return $sessionData;
    }
}