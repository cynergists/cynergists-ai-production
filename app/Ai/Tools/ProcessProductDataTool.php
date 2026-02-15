<?php

namespace App\Ai\Tools;

use App\Services\Arsenal\ArsenalSeverityService;
use App\Services\Arsenal\ArsenalLoggingService;
use App\Services\Arsenal\ArsenalEscalationService;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\Log;
use Stringable;

class ProcessProductDataTool implements Tool
{
    public function description(): string
    {
        return 'Arsenal Draft-Only Product Data Processor: Transforms unstructured product data into standardized draft listings. Validates critical fields, normalizes categories, detects duplicates. Enforces strict operational boundaries - never modifies live data or fabricates pricing/inventory. All outputs require human approval.';
    }

    public function handle(Request $request): Stringable|string
    {
        $sessionId = $request['session_id'] ?? \Illuminate\Support\Str::uuid();
        $userId = $request['user_id'] ?? 'unknown';
        $dataSource = $request['data_source'] ?? 'csv';
        $rawData = $request['raw_data'] ?? [];
        $normalizeCategories = $request['normalize_categories'] ?? true;
        $platformTarget = $request['platform_target'] ?? 'unknown';
        $clientConfig = $request['client_config'] ?? [];

        // Initialize services
        $severityService = app(ArsenalSeverityService::class);
        $loggingService = app(ArsenalLoggingService::class);
        $escalationService = app(ArsenalEscalationService::class);

        // Create session tracking
        $sessionData = $loggingService->createSessionData($userId, $platformTarget, $dataSource);
        $sessionData['session_id'] = $sessionId;

        try {
            // Validate input data exists
            if (empty($rawData)) {
                throw new \InvalidArgumentException('No product data provided for processing');
            }

            $processedProducts = [];
            $severityResults = [];
            $escalationTriggered = false;
            $processingHalted = false;

            foreach ($rawData as $index => $product) {
                // Analyze severity for each product
                $severityAnalysis = $severityService->analyzeProductSeverity($product, $clientConfig);
                $severityResults[] = $severityAnalysis;

                // Check for critical escalation
                if ($escalationService->requiresEscalation($severityAnalysis)) {
                    // Create escalation data
                    $escalationData = [
                        'session_id' => $sessionId,
                        'user_id' => $userId,
                        'reason' => ArsenalEscalationService::REASON_MISSING_SKU,
                        'description' => 'Critical field validation failed: ' . implode(', ', $severityAnalysis['issues']),
                        'product_sample' => $product,
                        'platform_target' => $platformTarget,
                        'data_source_type' => $dataSource,
                        'processing_stage' => 'field_validation',
                        'affected_records' => 1,
                    ];

                    // Escalate to Haven and halt processing
                    $escalationService->escalateToHaven($escalationData);
                    $escalationTriggered = true;
                    $processingHalted = true;
                    $sessionData['escalation'] = true;
                    break;
                }

                // Process product if no critical issues
                $processed = $this->processProduct($product, $index, $severityAnalysis, $normalizeCategories);
                $processedProducts[] = $processed;
            }

            // Calculate severity counts
            $severityCounts = $severityService->getBatchSeverityCounts($severityResults);
            $sessionData['severity_counts'] = $severityCounts;
            $sessionData['draft_batches_created'] = $processingHalted ? 0 : 1;

            // Determine tags based on processing
            $tags = ['catalog_cleanup'];
            if ($severityCounts['critical'] > 0) {
                $tags[] = 'critical_escalation';
            } elseif ($severityCounts['high'] > 0) {
                $tags[] = 'high_risk_data';
            } elseif ($severityCounts['medium'] > 0) {
                $tags[] = 'medium_issue';
            } elseif ($severityCounts['low'] > 0) {
                $tags[] = 'low_issue';
            }
            $sessionData['tags'] = $tags;

            // Complete session and log
            $loggingService->completeSession($sessionData);
            $loggingService->logSessionToGHL($sessionData);

            // Build response
            $results = [
                'success' => !$processingHalted,
                'draft_status' => 'DRAFT – REQUIRES HUMAN APPROVAL',
                'session_id' => $sessionId,
                'processing_halted' => $processingHalted,
                'escalation_triggered' => $escalationTriggered,
                'processing_summary' => [
                    'total_input' => count($rawData),
                    'processed_count' => count($processedProducts),
                    'severity_breakdown' => $severityCounts,
                    'processing_timestamp' => now()->toDateTimeString(),
                    'data_source' => $dataSource,
                    'platform_target' => $platformTarget,
                ],
                'processed_products' => $processedProducts,
                'severity_analysis' => $severityResults,
                'operational_boundaries' => [
                    'draft_only_mode' => true,
                    'no_live_data_modification' => true,
                    'no_pricing_fabrication' => true,
                    'no_inventory_modification' => true,
                    'human_approval_required' => true,
                ],
                'next_steps' => $this->generateNextSteps($processingHalted, $escalationTriggered, $severityCounts)
            ];

            return json_encode($results, JSON_PRETTY_PRINT);

        } catch (\Exception $e) {
            // Log error and escalate if necessary
            Log::error('Arsenal ProcessProductDataTool failed', [
                'session_id' => $sessionId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Escalate tool failure
            $escalationService->escalateToHaven(
                $escalationService->createToolFailureEscalation($sessionId, 'ProcessProductDataTool', $e->getMessage())
            );

            return json_encode([
                'success' => false,
                'draft_status' => 'PROCESSING FAILED – ESCALATED TO SUPPORT',
                'session_id' => $sessionId,
                'error' => 'Tool processing failed and has been escalated for manual review',
                'escalation_triggered' => true,
                'operational_boundaries' => [
                    'draft_only_mode' => true,
                    'no_live_data_modification' => true,
                    'processing_halted_on_error' => true,
                ],
            ], JSON_PRETTY_PRINT);
        }
    }

    private function normalizeCategory(string $category): string
    {
        $categoryMap = [
            'clothing' => 'Apparel',
            'clothes' => 'Apparel',
            'electronics' => 'Electronics',
            'tech' => 'Electronics',
            'books' => 'Books & Media',
            'home' => 'Home & Garden',
            'beauty' => 'Health & Beauty',
        ];

        $lowerCategory = strtolower(trim($category));
        return $categoryMap[$lowerCategory] ?? ucfirst($lowerCategory);
    }

    /**
     * Process individual product with severity analysis
     */
    private function processProduct(array $product, int $index, array $severityAnalysis, bool $normalizeCategories): array
    {
        $processed = [
            'original_index' => $index,
            'draft_status' => 'DRAFT – REQUIRES HUMAN APPROVAL',
            'severity' => $severityAnalysis['severity'],
            'issues' => $severityAnalysis['issues'],
            'requires_review' => $severityAnalysis['requires_review'],
            'can_continue' => $severityAnalysis['can_continue'],
        ];

        // Map fields (preserving original data structure)
        $processed['product_data'] = [
            'original_sku' => $product['sku'] ?? $product['product_id'] ?? '',
            'original_name' => $product['name'] ?? $product['product_name'] ?? '',
            'original_category' => $product['category'] ?? '',
            'original_description' => $product['description'] ?? '',
            // Note: Prices are only mapped if provided, never fabricated
            'original_price' => isset($product['price']) ? $this->preserveOriginalPrice($product['price']) : null,
        ];

        // Apply normalization (draft only)
        if ($normalizeCategories && !empty($product['category'])) {
            $processed['draft_normalized'] = [
                'category' => $this->normalizeCategory($product['category']),
                'normalization_applied' => true,
            ];
        }

        return $processed;
    }

    /**
     * Preserve original price without modification (per spec - no price fabrication)
     */
    private function preserveOriginalPrice($price): ?string
    {
        if (empty($price)) return null;
        
        // Return original price as string to preserve exact formatting
        // Arsenal must not fabricate or modify pricing
        return (string) $price;
    }

    /**
     * Generate next steps based on processing results
     */
    private function generateNextSteps(bool $processingHalted, bool $escalationTriggered, array $severityCounts): array
    {
        if ($processingHalted || $escalationTriggered) {
            return [
                'Processing has been halted due to critical issues',
                'Escalation sent to Haven for manual resolution',
                'No draft outputs generated - human intervention required',
                'Do not proceed until escalation is resolved',
            ];
        }

        $steps = ['All outputs are DRAFT-ONLY and require human approval before use'];

        if ($severityCounts['high'] > 0) {
            $steps[] = 'HIGH PRIORITY: Review flagged products with critical field issues';
            $steps[] = 'Validate all normalized categories against your approved taxonomy';
        }

        if ($severityCounts['medium'] > 0) {
            $steps[] = 'Review products with medium-severity field completeness issues';
        }

        $steps[] = 'Verify all product data accuracy before export to storefront';
        $steps[] = 'No pricing or inventory data has been modified or fabricated';
        
        return $steps;
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'session_id' => $schema
                ->string()
                ->description('Session ID for tracking and logging')
                ->required(),
            'user_id' => $schema
                ->string()
                ->description('User ID for session tracking')
                ->required(),
            'data_source' => $schema
                ->string()
                ->description('Type of data source (csv, json, api)')
                ->enum(['csv', 'json', 'api'])
                ->required(),
            'raw_data' => $schema
                ->array()
                ->description('Raw product data to be processed (array of product objects)')
                ->required(),
            'platform_target' => $schema
                ->string()
                ->description('Target eCommerce platform (must be explicitly specified)')
                ->enum(['shopify', 'woocommerce', 'magento', 'bigcommerce', 'squarespace'])
                ->required(),
            'normalize_categories' => $schema
                ->boolean()
                ->description('Whether to normalize product categories using approved taxonomy')
                ->default(true),
            'client_config' => $schema
                ->object()
                ->description('Optional client-specific configuration for field requirements')
                ->default([]),
        ];
    }
}