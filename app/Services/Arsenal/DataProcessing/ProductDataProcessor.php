<?php

namespace App\Services\Arsenal\DataProcessing;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class ProductDataProcessor
{
    /**
     * Process and normalize product data from various sources.
     */
    public function processProductData(array $rawData, string $sourceType = 'csv'): array
    {
        try {
            $normalizedData = $this->normalizeStructure($rawData, $sourceType);
            $validatedData = $this->validateRequiredFields($normalizedData);
            $standardizedData = $this->standardizeAttributes($validatedData);
            $deduplicatedData = $this->detectDuplicates($standardizedData);
            
            return [
                'processed_products' => $deduplicatedData,
                'processing_summary' => $this->generateProcessingSummary($rawData, $deduplicatedData),
                'validation_issues' => $this->getValidationIssues(),
                'draft_status' => 'DRAFT – REQUIRES HUMAN APPROVAL'
            ];
        } catch (\Exception $e) {
            Log::error('Product data processing failed: ' . $e->getMessage());
            throw new \Exception('Product data processing failed: ' . $e->getMessage());
        }
    }

    /**
     * Normalize data structure based on source type.
     */
    private function normalizeStructure(array $rawData, string $sourceType): array
    {
        switch ($sourceType) {
            case 'csv':
                return $this->normalizeCsvData($rawData);
            case 'json':
                return $this->normalizeJsonData($rawData);
            case 'api':
                return $this->normalizeApiData($rawData);
            default:
                throw new \Exception('Unsupported source type: ' . $sourceType);
        }
    }

    /**
     * Normalize CSV data structure.
     */
    private function normalizeCsvData(array $csvData): array
    {
        $normalized = [];
        foreach ($csvData as $row) {
            $normalized[] = $this->mapCsvFields($row);
        }
        return $normalized;
    }

    /**
     * Map CSV fields to standardized structure.
     */
    private function mapCsvFields(array $row): array
    {
        // Field mapping for common CSV variations
        $fieldMap = [
            'product_name' => ['name', 'title', 'product_title', 'item_name'],
            'sku' => ['sku', 'product_id', 'item_id', 'product_code'],
            'description' => ['description', 'product_description', 'desc', 'details'],
            'price' => ['price', 'cost', 'amount', 'product_price'],
            'category' => ['category', 'product_category', 'cat', 'type'],
            'inventory' => ['inventory', 'stock', 'quantity', 'qty'],
            'images' => ['images', 'image_urls', 'photos', 'pictures'],
            'brand' => ['brand', 'manufacturer', 'vendor', 'supplier']
        ];

        $normalized = [];
        foreach ($fieldMap as $standardField => $possibleFields) {
            foreach ($possibleFields as $field) {
                if (isset($row[$field])) {
                    $normalized[$standardField] = $row[$field];
                    break;
                }
            }
        }

        return $normalized;
    }

    /**
     * Normalize JSON data structure.
     */
    private function normalizeJsonData(array $jsonData): array
    {
        // Handle nested JSON structures and flatten to standard format
        $normalized = [];
        foreach ($jsonData as $product) {
            $normalized[] = $this->flattenJsonProduct($product);
        }
        return $normalized;
    }

    /**
     * Normalize API response data.
     */
    private function normalizeApiData(array $apiData): array
    {
        // Handle API-specific data structures
        return $this->normalizeJsonData($apiData);
    }

    /**
     * Flatten nested JSON product data.
     */
    private function flattenJsonProduct(array $product): array
    {
        $flattened = [];
        
        // Handle nested product information
        if (isset($product['product'])) {
            $product = array_merge($product, $product['product']);
            unset($product['product']);
        }

        // Handle nested attributes
        if (isset($product['attributes']) && is_array($product['attributes'])) {
            foreach ($product['attributes'] as $key => $value) {
                $flattened['attr_' . $key] = $value;
            }
            unset($product['attributes']);
        }

        // Handle variants
        if (isset($product['variants']) && is_array($product['variants'])) {
            $flattened['variants'] = $product['variants'];
            unset($product['variants']);
        }

        return array_merge($product, $flattened);
    }

    /**
     * Validate required fields are present.
     */
    private function validateRequiredFields(array $products): array
    {
        $requiredFields = ['product_name', 'sku'];
        $validatedProducts = [];
        
        foreach ($products as $index => $product) {
            $missingFields = [];
            foreach ($requiredFields as $field) {
                if (!isset($product[$field]) || empty($product[$field])) {
                    $missingFields[] = $field;
                }
            }
            
            if (!empty($missingFields)) {
                $product['validation_issues'] = $missingFields;
                $product['status'] = 'incomplete';
            } else {
                $product['status'] = 'valid';
            }
            
            $validatedProducts[] = $product;
        }
        
        return $validatedProducts;
    }

    /**
     * Standardize product attributes to storefront schema.
     */
    private function standardizeAttributes(array $products): array
    {
        foreach ($products as &$product) {
            // Standardize category taxonomy
            if (isset($product['category'])) {
                $product['category'] = $this->standardizeCategory($product['category']);
            }
            
            // Standardize pricing format
            if (isset($product['price'])) {
                $product['price'] = $this->standardizePrice($product['price']);
            }
            
            // Standardize variants
            if (isset($product['variants'])) {
                $product['variants'] = $this->standardizeVariants($product['variants']);
            }
            
            // Clean up product name
            if (isset($product['product_name'])) {
                $product['product_name'] = $this->cleanProductName($product['product_name']);
            }
        }
        
        return $products;
    }

    /**
     * Standardize category to approved taxonomy.
     */
    private function standardizeCategory(string $category): string
    {
        // TODO: Implement category mapping to approved taxonomy
        // This would map various category names to standardized categories
        $categoryMap = [
            'clothing' => 'Apparel',
            'clothes' => 'Apparel',
            'electronics' => 'Electronics',
            'tech' => 'Electronics',
            // Add more mappings as needed
        ];
        
        $lowerCategory = strtolower(trim($category));
        return $categoryMap[$lowerCategory] ?? ucfirst($lowerCategory);
    }

    /**
     * Standardize price format.
     */
    private function standardizePrice($price): ?float
    {
        if (empty($price)) return null;
        
        // Remove currency symbols and clean up
        $cleaned = preg_replace('/[^0-9.]/', '', $price);
        return $cleaned ? (float) $cleaned : null;
    }

    /**
     * Standardize product variants.
     */
    private function standardizeVariants(array $variants): array
    {
        $standardized = [];
        foreach ($variants as $variant) {
            if (is_array($variant)) {
                $standardized[] = [
                    'sku' => $variant['sku'] ?? '',
                    'attributes' => $variant['attributes'] ?? [],
                    'price' => isset($variant['price']) ? $this->standardizePrice($variant['price']) : null,
                    'inventory' => $variant['inventory'] ?? null
                ];
            }
        }
        return $standardized;
    }

    /**
     * Clean product name.
     */
    private function cleanProductName(string $name): string
    {
        // Remove excessive whitespace and special characters
        return trim(preg_replace('/\s+/', ' ', $name));
    }

    /**
     * Detect duplicate SKUs.
     */
    private function detectDuplicates(array $products): array
    {
        $skus = [];
        foreach ($products as &$product) {
            $sku = $product['sku'] ?? '';
            if (!empty($sku)) {
                if (in_array($sku, $skus)) {
                    $product['duplicate_sku'] = true;
                    $product['validation_issues'][] = 'duplicate_sku';
                } else {
                    $skus[] = $sku;
                }
            }
        }
        return $products;
    }

    /**
     * Generate processing summary.
     */
    private function generateProcessingSummary(array $rawData, array $processedData): array
    {
        $validCount = count(array_filter($processedData, fn($p) => ($p['status'] ?? '') === 'valid'));
        $invalidCount = count($processedData) - $validCount;
        
        return [
            'total_input' => count($rawData),
            'total_processed' => count($processedData),
            'valid_products' => $validCount,
            'invalid_products' => $invalidCount,
            'duplicate_skus' => count(array_filter($processedData, fn($p) => isset($p['duplicate_sku']))),
            'processing_timestamp' => now()->toDateTimeString()
        ];
    }

    /**
     * Get validation issues summary.
     */
    private function getValidationIssues(): array
    {
        // TODO: Collect and return validation issues found during processing
        return [];
    }
}