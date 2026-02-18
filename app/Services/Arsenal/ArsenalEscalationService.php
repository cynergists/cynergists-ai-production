<?php

namespace App\Services\Arsenal;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ArsenalEscalationService
{
    /**
     * Escalation reasons as defined in Developer Decision Spec
     */
    public const REASON_CRITICAL_SEVERITY = 'critical_severity_triggered';
    public const REASON_UNSUPPORTED_PLATFORM = 'unsupported_platform_detected';
    public const REASON_UNKNOWN_DATA_FORMAT = 'unknown_data_format';
    public const REASON_TOOL_FAILURE = 'tool_failure';
    public const REASON_SCOPE_VIOLATION = 'request_outside_defined_scope';
    public const REASON_MISSING_SKU = 'missing_sku';
    public const REASON_CORRUPTED_FILE = 'corrupted_file';
    public const REASON_PARSER_FAILURE = 'parser_failure';

    /**
     * Escalate critical issue to Haven
     *
     * @param array $escalationData Escalation details
     * @return bool Success status
     */
    public function escalateToHaven(array $escalationData): bool
    {
        try {
            // Validate escalation data
            $this->validateEscalationData($escalationData);

            // Build escalation payload
            $payload = $this->buildEscalationPayload($escalationData);

            // Log escalation locally first
            Log::critical('Arsenal: Escalating to Haven', $payload);

            // Attempt to send to Haven system
            $havenSuccess = $this->sendToHaven($payload);

            if (!$havenSuccess) {
                // Trigger fallback notification
                $this->triggerFallbackNotification($payload);
            }

            // Log the escalation event
            app(ArsenalLoggingService::class)->logRealTimeEvent([
                'event_type' => 'escalation',
                'severity' => 'critical',
                'session_id' => $escalationData['session_id'],
                'user_id' => $escalationData['user_id'] ?? 'unknown',
                'escalation_reason' => $escalationData['reason'],
                'haven_delivery_success' => $havenSuccess,
                'timestamp' => now()->toISOString(),
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('Arsenal: Escalation failed', [
                'escalation_data' => $escalationData,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            // Always try fallback on exception
            $this->triggerFallbackNotification($escalationData);
            return false;
        }
    }

    /**
     * Check if escalation is required based on severity analysis
     *
     * @param array $severityResult Result from ArsenalSeverityService
     * @return bool Whether escalation is needed
     */
    public function requiresEscalation(array $severityResult): bool
    {
        return $severityResult['escalation_required'] ?? false;
    }

    /**
     * Build escalation payload for Haven
     */
    private function buildEscalationPayload(array $escalationData): array
    {
        return [
            'agent' => 'Arsenal',
            'escalation_id' => \Illuminate\Support\Str::uuid(),
            'timestamp' => now()->toISOString(),
            'session_summary' => [
                'session_id' => $escalationData['session_id'],
                'user_id' => $escalationData['user_id'] ?? 'unknown',
                'platform_target' => $escalationData['platform_target'] ?? 'unknown',
                'data_source_type' => $escalationData['data_source_type'] ?? 'unknown',
                'processing_stage' => $escalationData['processing_stage'] ?? 'unknown',
            ],
            'escalation_details' => [
                'reason_code' => $escalationData['reason'],
                'severity_level' => 'critical',
                'description' => $escalationData['description'] ?? $this->getReasonDescription($escalationData['reason']),
                'affected_records' => $escalationData['affected_records'] ?? 0,
                'data_format_involved' => $escalationData['data_format'] ?? 'unknown',
                'platform_involved' => $escalationData['platform_target'] ?? 'unknown',
            ],
            'context' => [
                'product_data_sample' => $escalationData['product_sample'] ?? null,
                'validation_errors' => $escalationData['validation_errors'] ?? [],
                'processing_attempts' => $escalationData['processing_attempts'] ?? 1,
                'user_inputs' => $escalationData['user_inputs'] ?? [],
            ],
            'required_actions' => [
                'stop_processing' => true,
                'notify_client_success' => true,
                'await_manual_resolution' => true,
                'log_incident' => true,
            ],
            'structured_tags' => ['critical_escalation', 'arsenal_processing_halt'],
        ];
    }

    /**
     * Send escalation to Haven system
     */
    private function sendToHaven(array $payload): bool
    {
        try {
            // Haven integration - this would be the actual Haven API endpoint
            $havenUrl = config('services.haven.api_url');
            $havenApiKey = config('services.haven.api_key');

            if (!$havenUrl || !$havenApiKey) {
                Log::warning('Arsenal: Haven configuration not available, skipping Haven delivery');
                return false;
            }

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $havenApiKey,
                'Content-Type' => 'application/json',
                'X-Source-Agent' => 'Arsenal',
            ])->timeout(30)->post("{$havenUrl}/escalations", $payload);

            if ($response->successful()) {
                Log::info('Arsenal: Successfully escalated to Haven', [
                    'escalation_id' => $payload['escalation_id'],
                    'session_id' => $payload['session_summary']['session_id'],
                ]);
                return true;
            } else {
                Log::error('Arsenal: Haven escalation failed', [
                    'response_status' => $response->status(),
                    'response_body' => $response->body(),
                    'escalation_id' => $payload['escalation_id'],
                ]);
                return false;
            }

        } catch (\Exception $e) {
            Log::error('Arsenal: Exception during Haven escalation', [
                'error' => $e->getMessage(),
                'escalation_id' => $payload['escalation_id'],
            ]);
            return false;
        }
    }

    /**
     * Trigger fallback human Client Success notification
     */
    private function triggerFallbackNotification(array $escalationData): void
    {
        try {
            $notificationData = [
                'type' => 'arsenal_critical_escalation',
                'session_id' => $escalationData['session_id'] ?? 'unknown',
                'user_id' => $escalationData['user_id'] ?? 'unknown',
                'reason' => $escalationData['reason'] ?? 'unknown',
                'description' => $escalationData['description'] ?? 'Critical Arsenal escalation',
                'timestamp' => now()->toISOString(),
                'requires_immediate_attention' => true,
            ];

            // Send email to client success team
            $clientSuccessEmail = config('services.arsenal.client_success_email', 'support@cynergists.com');
            
            Mail::send('emails.arsenal-escalation', $notificationData, function ($message) use ($clientSuccessEmail) {
                $message->to($clientSuccessEmail)
                        ->subject('URGENT: Arsenal Critical Escalation')
                        ->priority(1); // High priority
            });

            Log::info('Arsenal: Fallback notification sent', [
                'session_id' => $escalationData['session_id'] ?? 'unknown',
                'notification_email' => $clientSuccessEmail,
            ]);

        } catch (\Exception $e) {
            Log::error('Arsenal: Fallback notification failed', [
                'error' => $e->getMessage(),
                'escalation_data' => $escalationData,
            ]);
        }
    }

    /**
     * Validate escalation data has required fields
     */
    private function validateEscalationData(array $escalationData): void
    {
        $required = ['session_id', 'reason'];
        
        foreach ($required as $field) {
            if (empty($escalationData[$field])) {
                throw new \InvalidArgumentException("Escalation data missing required field: {$field}");
            }
        }

        // Validate reason code
        $validReasons = [
            self::REASON_CRITICAL_SEVERITY,
            self::REASON_UNSUPPORTED_PLATFORM,
            self::REASON_UNKNOWN_DATA_FORMAT,
            self::REASON_TOOL_FAILURE,
            self::REASON_SCOPE_VIOLATION,
            self::REASON_MISSING_SKU,
            self::REASON_CORRUPTED_FILE,
            self::REASON_PARSER_FAILURE,
        ];

        if (!in_array($escalationData['reason'], $validReasons)) {
            throw new \InvalidArgumentException("Invalid escalation reason: {$escalationData['reason']}");
        }
    }

    /**
     * Get human-readable description for reason code
     */
    private function getReasonDescription(string $reasonCode): string
    {
        $descriptions = [
            self::REASON_CRITICAL_SEVERITY => 'Critical severity threshold reached during product data processing',
            self::REASON_UNSUPPORTED_PLATFORM => 'User requested processing for an unsupported eCommerce platform',
            self::REASON_UNKNOWN_DATA_FORMAT => 'Encountered unknown or unrecognized data format that cannot be processed',
            self::REASON_TOOL_FAILURE => 'Internal Arsenal tool or parser component failed during processing',
            self::REASON_SCOPE_VIOLATION => 'User requested functionality outside of Arsenal\'s defined scope',
            self::REASON_MISSING_SKU => 'Product data missing required SKU or unique identifier',
            self::REASON_CORRUPTED_FILE => 'Uploaded file appears to be corrupted or unreadable',
            self::REASON_PARSER_FAILURE => 'Data parser failed to process the provided input',
        ];

        return $descriptions[$reasonCode] ?? "Unknown escalation reason: {$reasonCode}";
    }

    /**
     * Create escalation data for missing SKU
     */
    public function createMissingSKUEscalation(string $sessionId, array $productSample = []): array
    {
        return [
            'session_id' => $sessionId,
            'reason' => self::REASON_MISSING_SKU,
            'description' => 'Product data is missing required SKU or unique product identifier',
            'product_sample' => $productSample,
            'processing_stage' => 'field_validation',
            'affected_records' => 1,
        ];
    }

    /**
     * Create escalation data for unsupported platform
     */
    public function createUnsupportedPlatformEscalation(string $sessionId, string $platform): array
    {
        return [
            'session_id' => $sessionId,
            'reason' => self::REASON_UNSUPPORTED_PLATFORM,
            'description' => "Unsupported eCommerce platform requested: {$platform}",
            'platform_target' => $platform,
            'processing_stage' => 'platform_validation',
        ];
    }

    /**
     * Create escalation data for tool failure
     */
    public function createToolFailureEscalation(string $sessionId, string $toolName, string $errorMessage): array
    {
        return [
            'session_id' => $sessionId,
            'reason' => self::REASON_TOOL_FAILURE,
            'description' => "Arsenal tool '{$toolName}' failed: {$errorMessage}",
            'processing_stage' => 'tool_execution',
            'tool_name' => $toolName,
            'error_details' => $errorMessage,
        ];
    }
}