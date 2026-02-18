<?php

namespace App\Services\Arsenal;

use App\Ai\Agents\Arsenal;
use App\Models\PortalAvailableAgent;
use App\Models\PortalTenant;
use App\Models\User;
use App\Services\Arsenal\DataProcessing\ProductDataProcessor;
use App\Services\Arsenal\DataProcessing\ImageProcessor;
use App\Services\Arsenal\DataProcessing\ContentGenerator;
use App\Services\GoHighLevelService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ArsenalAgentHandler
{
    public function __construct(
        private GoHighLevelService $ghlService,
        private ProductDataProcessor $dataProcessor,
        private ImageProcessor $imageProcessor,
        private ContentGenerator $contentGenerator
    ) {}

    /**
     * Handle an incoming chat message and generate a response.
     */
    public function handle(string $message, User $user, PortalAvailableAgent $agent, PortalTenant $tenant, array $conversationHistory = [], int $maxTokens = 1024): string
    {
        try {
            $sessionId = $this->generateSessionId($user, $tenant);
            
            // Log session start to CRM
            $this->logSessionStart($sessionId, $user, $tenant);

            $arsenalAgent = new Arsenal(
                user: $user,
                tenant: $tenant,
                conversationHistory: $conversationHistory
            );

            $response = $arsenalAgent->prompt(
                prompt: $message,
                provider: 'anthropic',
                timeout: 120
            );

            $responseText = (string) $response;

            // Process any eCommerce data processing commands
            $processedResponse = $this->processEcommerceOperations($responseText, $user, $tenant, $sessionId);

            // Log session activity to CRM
            $this->logSessionActivity($sessionId, $user, $tenant, $message, $processedResponse);

            return $this->stripInternalMarkers($processedResponse);
            
        } catch (\Exception $e) {
            Log::error('Laravel AI error in Arsenal: '.$e->getMessage(), [
                'exception' => $e,
                'user_id' => $user->id,
                'tenant_id' => $tenant->id,
            ]);

            // Log error to CRM
            $this->logEscalation($user, $tenant, 'tool_failure', $e->getMessage());

            return "I'm experiencing technical difficulties with catalog processing. This issue has been escalated to Cyera for immediate resolution. Please ensure all data sources are approved and properly formatted.";
        }
    }

    /**
     * Process eCommerce operation markers in the response.
     */
    private function processEcommerceOperations(string $response, User $user, PortalTenant $tenant, string $sessionId): string
    {
        // Check for data ingestion requests
        if (preg_match('/\[INGEST_DATA:.*?\]/s', $response)) {
            // TODO: Process data ingestion request
            // This would integrate with ProductDataProcessor
            $this->logActivity($sessionId, $user, $tenant, 'data_ingestion_requested');
        }

        // Check for product normalization requests
        if (preg_match('/\[NORMALIZE_PRODUCTS:.*?\]/s', $response)) {
            // TODO: Process normalization request
            // This would use the DataProcessor to normalize product data
            $this->logActivity($sessionId, $user, $tenant, 'product_normalization');
        }

        // Check for content generation requests
        if (preg_match('/\[GENERATE_CONTENT:.*?\]/s', $response)) {
            // TODO: Process content generation
            // This would use ContentGenerator to create draft content
            $this->logActivity($sessionId, $user, $tenant, 'content_generation');
        }

        // Check for image processing requests
        if (preg_match('/\[PROCESS_IMAGES:.*?\]/s', $response)) {
            // TODO: Process image validation and alt-text generation
            // This would use ImageProcessor for image operations
            $this->logActivity($sessionId, $user, $tenant, 'image_processing');
        }

        // Check for draft export requests
        if (preg_match('/\[EXPORT_DRAFT:.*?\]/s', $response)) {
            // TODO: Generate structured export (JSON/CSV)
            // All exports must be labeled as DRAFT - REQUIRES HUMAN APPROVAL
            $this->logActivity($sessionId, $user, $tenant, 'draft_export_generated');
        }

        // Check for scope violations (publishing attempts)
        if (preg_match('/\[PUBLISH|LIVE|DEPLOY\]/i', $response)) {
            $this->logEscalation($user, $tenant, 'scope_violation', 'Publishing attempt detected');
            return "⚠️ SCOPE VIOLATION: Arsenal is a draft-only system. I cannot publish or deploy listings. All outputs require human approval before external usage. This attempt has been logged and escalated to Cyera.";
        }

        return $response;
    }

    /**
     * Log session start to Go High Level CRM.
     */
    private function logSessionStart(string $sessionId, User $user, PortalTenant $tenant): void
    {
        try {
            $this->ghlService->createNote($tenant, "Arsenal Session Started", [
                'user_id' => $user->id,
                'session_id' => $sessionId,
                'timestamp' => now()->toDateTimeString(),
                'agent' => 'Arsenal',
                'type' => 'session_start',
                'tags' => ['catalog-cleanup', 'arsenal-session']
            ]);
        } catch (\Exception $e) {
            Log::warning('Failed to log Arsenal session start to GHL: ' . $e->getMessage());
        }
    }

    /**
     * Log session activity to Go High Level CRM.
     */
    private function logSessionActivity(string $sessionId, User $user, PortalTenant $tenant, string $input, string $response): void
    {
        try {
            $this->ghlService->createNote($tenant, "Arsenal Activity", [
                'user_id' => $user->id,
                'session_id' => $sessionId,
                'timestamp' => now()->toDateTimeString(),
                'input_summary' => substr($input, 0, 100) . (strlen($input) > 100 ? '...' : ''),
                'response_summary' => substr($response, 0, 100) . (strlen($response) > 100 ? '...' : ''),
                'type' => 'session_activity',
                'tags' => ['catalog-cleanup', 'arsenal-activity']
            ]);
        } catch (\Exception $e) {
            Log::warning('Failed to log Arsenal activity to GHL: ' . $e->getMessage());
        }
    }

    /**
     * Log specific activities to CRM.
     */
    private function logActivity(string $sessionId, User $user, PortalTenant $tenant, string $activity): void
    {
        try {
            $tags = ['catalog-cleanup', 'arsenal-session'];
            
            // Add activity-specific tags
            switch ($activity) {
                case 'content_generation':
                    $tags[] = 'content-generation';
                    break;
                case 'image_processing':
                    $tags[] = 'image-preparation';
                    break;
                case 'data_ingestion_requested':
                case 'product_normalization':
                    $tags[] = 'data-normalization';
                    break;
                case 'draft_export_generated':
                    $tags[] = 'draft-export';
                    break;
            }

            $this->ghlService->createNote($tenant, "Arsenal: " . ucfirst(str_replace('_', ' ', $activity)), [
                'user_id' => $user->id,
                'session_id' => $sessionId,
                'timestamp' => now()->toDateTimeString(),
                'activity' => $activity,
                'type' => 'arsenal_activity',
                'tags' => $tags
            ]);
        } catch (\Exception $e) {
            Log::warning('Failed to log Arsenal activity to GHL: ' . $e->getMessage());
        }
    }

    /**
     * Log escalation to Cyera.
     */
    private function logEscalation(User $user, PortalTenant $tenant, string $reason, string $details): void
    {
        try {
            $escalationData = [
                'user_id' => $user->id,
                'tenant_id' => $tenant->id,
                'session_id' => $this->generateSessionId($user, $tenant),
                'timestamp' => now()->toDateTimeString(),
                'escalation_reason' => $reason,
                'details' => $details,
                'severity_level' => $this->getSeverityLevel($reason),
                'agent' => 'Arsenal'
            ];

            $this->ghlService->createNote($tenant, "Arsenal Escalation: " . ucfirst(str_replace('_', ' ', $reason)), [
                ...$escalationData,
                'type' => 'escalation',
                'tags' => ['escalation', 'arsenal-escalation', 'requires-attention']
            ]);

            // TODO: Integrate with Cyera escalation system
            Log::error('Arsenal escalation logged', $escalationData);

        } catch (\Exception $e) {
            Log::error('Failed to log Arsenal escalation: ' . $e->getMessage());
        }
    }

    /**
     * Generate a unique session ID.
     */
    private function generateSessionId(User $user, PortalTenant $tenant): string
    {
        return 'arsenal_' . $tenant->id . '_' . $user->id . '_' . time();
    }

    /**
     * Get severity level based on escalation reason.
     */
    private function getSeverityLevel(string $reason): string
    {
        return match ($reason) {
            'scope_violation' => 'high',
            'tool_failure', 'integration_failure' => 'medium',
            'unknown_format', 'missing_data' => 'low',
            default => 'medium'
        };
    }

    /**
     * Remove internal processing markers from the response.
     */
    private function stripInternalMarkers(string $response): string
    {
        // Remove any internal eCommerce processing markers
        $cleaned = preg_replace('/\[INGEST_.*?\]/s', '', $response);
        $cleaned = preg_replace('/\[NORMALIZE_.*?\]/s', '', $cleaned);
        $cleaned = preg_replace('/\[GENERATE_.*?\]/s', '', $cleaned);
        $cleaned = preg_replace('/\[PROCESS_.*?\]/s', '', $cleaned);
        $cleaned = preg_replace('/\[EXPORT_.*?\]/s', '', $cleaned);
        $cleaned = preg_replace('/\n{3,}/', "\n\n", $cleaned);

        return trim($cleaned);
    }
}