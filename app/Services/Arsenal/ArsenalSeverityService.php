<?php

namespace App\Services\Arsenal;

use Illuminate\Support\Facades\Log;

class ArsenalSeverityService
{
    /**
     * Critical fields as defined in Developer Decision Spec v1.0
     */
    private const CRITICAL_FIELDS = [
        'sku',
        'product_id',
        'unique_identifier',
        'product_name',
        'name',
        'title',
        'category',
        'variants',
        'attributes',
        'images',
        'image_urls',
    ];

    /**
     * Severity levels as defined in spec
     */
    public const SEVERITY_LOW = 'low';
    public const SEVERITY_MEDIUM = 'medium';
    public const SEVERITY_HIGH = 'high';
    public const SEVERITY_CRITICAL = 'critical';

    /**
     * Analyze product data and determine severity level
     *
     * @param array $productData Single product data array
     * @param array $clientConfig Optional client-specific field configuration
     * @return array Analysis result with severity, issues, and actions
     */
    public function analyzeProductSeverity(array $productData, array $clientConfig = []): array
    {
        $criticalFields = $clientConfig['critical_fields'] ?? self::CRITICAL_FIELDS;
        $issues = [];
        $severity = self::SEVERITY_LOW;
        $actions = [];
        $tags = [];

        // Check for missing SKU/Unique Identifier - CRITICAL
        if (!$this->hasRequiredIdentifier($productData)) {
            return [
                'severity' => self::SEVERITY_CRITICAL,
                'issues' => ['Missing SKU or unique product identifier'],
                'actions' => ['stop_processing', 'escalate_to_haven'],
                'tags' => ['critical_escalation'],
                'can_continue' => false,
                'escalation_required' => true,
            ];
        }

        // Check other critical fields
        $missingCriticalFields = $this->getMissingCriticalFields($productData, $criticalFields);
        if (!empty($missingCriticalFields)) {
            $severity = self::SEVERITY_HIGH;
            $issues[] = 'Missing critical fields: ' . implode(', ', $missingCriticalFields);
            $actions[] = 'flag_for_review';
            $tags[] = 'high_risk_data';
        }

        // Check non-critical field thresholds
        $nonCriticalAnalysis = $this->analyzeNonCriticalFields($productData, $criticalFields);
        if ($nonCriticalAnalysis['missing_percentage'] >= 50) {
            $severity = max($severity, self::SEVERITY_HIGH);
            $issues[] = "≥50% non-critical fields missing ({$nonCriticalAnalysis['missing_percentage']}%)";
            $actions[] = 'flag_prominently';
            $tags[] = 'high_risk_data';
        } elseif ($nonCriticalAnalysis['missing_percentage'] >= 25) {
            $severity = max($severity, self::SEVERITY_MEDIUM);
            $issues[] = "≥25% non-critical fields missing ({$nonCriticalAnalysis['missing_percentage']}%)";
            $actions[] = 'flag_for_review';
            $tags[] = 'medium_issue';
        }

        // Check for cosmetic issues
        $cosmeticIssues = $this->detectCosmeticIssues($productData);
        if (!empty($cosmeticIssues) && $severity === self::SEVERITY_LOW) {
            $issues = array_merge($issues, $cosmeticIssues);
            $tags[] = 'low_issue';
        }

        return [
            'severity' => $severity,
            'issues' => $issues,
            'actions' => $actions,
            'tags' => $tags,
            'can_continue' => $severity !== self::SEVERITY_CRITICAL,
            'escalation_required' => $severity === self::SEVERITY_CRITICAL,
            'requires_review' => in_array($severity, [self::SEVERITY_HIGH, self::SEVERITY_MEDIUM]),
        ];
    }

    /**
     * Check if product has required identifier (SKU, product_id, etc.)
     */
    private function hasRequiredIdentifier(array $productData): bool
    {
        $identifierFields = ['sku', 'product_id', 'unique_identifier', 'id'];
        
        foreach ($identifierFields as $field) {
            if (!empty($productData[$field]) && is_string($productData[$field]) && trim($productData[$field]) !== '') {
                return true;
            }
        }

        return false;
    }

    /**
     * Get missing critical fields (excluding identifier which is checked separately)
     */
    private function getMissingCriticalFields(array $productData, array $criticalFields): array
    {
        $missing = [];
        $identifierFields = ['sku', 'product_id', 'unique_identifier'];

        foreach ($criticalFields as $field) {
            // Skip identifier fields (handled separately)
            if (in_array($field, $identifierFields)) {
                continue;
            }

            // Check for product name/title variants
            if (in_array($field, ['product_name', 'name', 'title'])) {
                if (!$this->hasProductTitle($productData)) {
                    $missing[] = 'product_title';
                }
                continue;
            }

            // Check for category
            if ($field === 'category') {
                if (empty($productData['category']) && empty($productData['product_category'])) {
                    $missing[] = 'category';
                }
                continue;
            }

            // Check for variants/attributes
            if (in_array($field, ['variants', 'attributes'])) {
                if (!$this->hasVariantStructure($productData)) {
                    $missing[] = 'variant_structure';
                }
                continue;
            }

            // Check for images
            if (in_array($field, ['images', 'image_urls'])) {
                if (!$this->hasImageReference($productData)) {
                    $missing[] = 'image_reference';
                }
                continue;
            }
        }

        return array_unique($missing);
    }

    /**
     * Check if product has title/name
     */
    private function hasProductTitle(array $productData): bool
    {
        $titleFields = ['product_name', 'name', 'title'];
        
        foreach ($titleFields as $field) {
            if (!empty($productData[$field]) && trim($productData[$field]) !== '') {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if product has variant/attribute structure
     */
    private function hasVariantStructure(array $productData): bool
    {
        return !empty($productData['variants']) || 
               !empty($productData['attributes']) || 
               !empty($productData['options']) ||
               // Even single variant counts as structure
               (isset($productData['variant_count']) && $productData['variant_count'] >= 1);
    }

    /**
     * Check if product has image reference OR explicit confirmation of no image
     */
    private function hasImageReference(array $productData): bool
    {
        $imageFields = ['images', 'image_urls', 'image_url', 'featured_image'];
        
        foreach ($imageFields as $field) {
            if (!empty($productData[$field])) {
                return true;
            }
        }

        // Check for explicit no-image confirmation
        return !empty($productData['no_image_confirmed']) || 
               !empty($productData['images_not_available']);
    }

    /**
     * Analyze non-critical field completeness
     */
    private function analyzeNonCriticalFields(array $productData, array $criticalFields): array
    {
        $allFields = array_keys($productData);
        $nonCriticalFields = array_diff($allFields, $criticalFields);
        
        if (empty($nonCriticalFields)) {
            return ['missing_percentage' => 0, 'missing_count' => 0, 'total_count' => 0];
        }

        $missingCount = 0;
        foreach ($nonCriticalFields as $field) {
            $fieldValue = $productData[$field] ?? null;
            
            // Handle different field types
            if ($fieldValue === null || $fieldValue === '') {
                $missingCount++;
            } elseif (is_string($fieldValue) && trim($fieldValue) === '') {
                $missingCount++;
            } elseif (is_array($fieldValue) && empty($fieldValue)) {
                $missingCount++;
            }
            // Arrays with content and non-empty strings are considered valid
        }

        $missingPercentage = round(($missingCount / count($nonCriticalFields)) * 100);

        return [
            'missing_percentage' => $missingPercentage,
            'missing_count' => $missingCount,
            'total_count' => count($nonCriticalFields),
        ];
    }

    /**
     * Detect cosmetic issues that don't affect functionality
     */
    private function detectCosmeticIssues(array $productData): array
    {
        $issues = [];

        // Check for formatting inconsistencies
        if (!empty($productData['product_name']) && $productData['product_name'] !== trim($productData['product_name'])) {
            $issues[] = 'Product name has leading/trailing whitespace';
        }

        // Check for inconsistent category formatting
        if (!empty($productData['category']) && $productData['category'] !== ucfirst(strtolower($productData['category']))) {
            $issues[] = 'Category formatting inconsistency';
        }

        return $issues;
    }

    /**
     * Get severity counts for batch processing
     */
    public function getBatchSeverityCounts(array $severityResults): array
    {
        $counts = [
            self::SEVERITY_LOW => 0,
            self::SEVERITY_MEDIUM => 0,
            self::SEVERITY_HIGH => 0,
            self::SEVERITY_CRITICAL => 0,
        ];

        foreach ($severityResults as $result) {
            if (isset($result['severity'])) {
                $counts[$result['severity']]++;
            }
        }

        return $counts;
    }
}