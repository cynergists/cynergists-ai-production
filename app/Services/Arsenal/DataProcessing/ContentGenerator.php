<?php

namespace App\Services\Arsenal\DataProcessing;

use Illuminate\Support\Facades\Log;

class ContentGenerator
{
    /**
     * Generate draft product content based on product data and brand tone.
     */
    public function generateProductContent(array $productData, ?array $brandTone = null): array
    {
        try {
            $draftTitle = $this->generateDraftTitle($productData, $brandTone);
            $draftDescription = $this->generateDraftDescription($productData, $brandTone);
            $bulletPoints = $this->generateBulletPoints($productData);
            $seoMetadata = $this->generateSeoMetadata($productData, $draftTitle, $brandTone);

            return [
                'draft_title' => $draftTitle,
                'draft_description' => $draftDescription,
                'bullet_points' => $bulletPoints,
                'seo_metadata' => $seoMetadata,
                'draft_status' => 'DRAFT – REQUIRES HUMAN APPROVAL',
                'generated_at' => now()->toDateTimeString()
            ];
        } catch (\Exception $e) {
            Log::error('Content generation failed: ' . $e->getMessage());
            throw new \Exception('Content generation failed: ' . $e->getMessage());
        }
    }

    /**
     * Generate draft product title.
     */
    private function generateDraftTitle(array $productData, ?array $brandTone = null): string
    {
        $name = $productData['product_name'] ?? 'Product';
        $brand = $productData['brand'] ?? null;
        $category = $productData['category'] ?? null;

        // Build title components
        $titleComponents = [];

        if ($brand && !str_contains(strtolower($name), strtolower($brand))) {
            $titleComponents[] = $brand;
        }

        $titleComponents[] = $name;

        // Add category if relevant and not already in name
        if ($category && !str_contains(strtolower($name), strtolower($category))) {
            // Only add category if it adds value
            if (strlen($category) < 20) {
                $titleComponents[] = "- {$category}";
            }
        }

        $title = implode(' ', $titleComponents);

        // Apply brand tone adjustments if provided
        if ($brandTone) {
            $title = $this->applyBrandTone($title, $brandTone);
        }

        // Ensure title is within reasonable length (60-70 chars for SEO)
        if (strlen($title) > 70) {
            $title = substr($title, 0, 67) . '...';
        }

        return $title;
    }

    /**
     * Generate draft product description.
     */
    private function generateDraftDescription(array $productData, ?array $brandTone = null): string
    {
        $name = $productData['product_name'] ?? 'this product';
        $category = $productData['category'] ?? 'product';
        $brand = $productData['brand'] ?? null;

        // Start with product introduction
        $description = [];

        if ($brand) {
            $description[] = "Discover {$name} from {$brand}.";
        } else {
            $description[] = "Discover {$name}.";
        }

        // Add category-based context
        $description[] = $this->generateCategoryContext($category, $name);

        // Add features if available
        if (isset($productData['features']) && is_array($productData['features'])) {
            $featureText = 'Key features include: ' . implode(', ', array_slice($productData['features'], 0, 3));
            $description[] = $featureText . '.';
        }

        // Add materials/specifications if available
        if (isset($productData['materials'])) {
            $description[] = "Made with {$productData['materials']}.";
        }

        // Add sizing info if available
        if (isset($productData['variants']) && !empty($productData['variants'])) {
            $description[] = 'Available in multiple options.';
        }

        $fullDescription = implode(' ', $description);

        // Apply brand tone if provided
        if ($brandTone) {
            $fullDescription = $this->applyBrandTone($fullDescription, $brandTone);
        }

        return $fullDescription;
    }

    /**
     * Generate category-specific context.
     */
    private function generateCategoryContext(string $category, string $productName): string
    {
        $categoryLower = strtolower($category);

        $contextMap = [
            'apparel' => "This {$category} item combines style and comfort for everyday wear.",
            'electronics' => "This {$category} device offers modern features and reliable performance.",
            'home' => "Enhance your space with this {$category} essential.",
            'accessories' => "Complete your look with this versatile {$category} piece.",
            'beauty' => "This {$category} product is designed to enhance your natural beauty.",
            'sports' => "Elevate your performance with this {$category} gear.",
        ];

        foreach ($contextMap as $key => $context) {
            if (str_contains($categoryLower, $key)) {
                return $context;
            }
        }

        return "This {$category} is crafted for quality and functionality.";
    }

    /**
     * Generate structured bullet points.
     */
    private function generateBulletPoints(array $productData): array
    {
        $bulletPoints = [];

        // Add brand
        if (isset($productData['brand'])) {
            $bulletPoints[] = "Brand: {$productData['brand']}";
        }

        // Add category
        if (isset($productData['category'])) {
            $bulletPoints[] = "Category: {$productData['category']}";
        }

        // Add SKU
        if (isset($productData['sku'])) {
            $bulletPoints[] = "SKU: {$productData['sku']}";
        }

        // Add materials
        if (isset($productData['materials'])) {
            $bulletPoints[] = "Materials: {$productData['materials']}";
        }

        // Add features
        if (isset($productData['features']) && is_array($productData['features'])) {
            foreach (array_slice($productData['features'], 0, 5) as $feature) {
                $bulletPoints[] = $feature;
            }
        }

        // Add variant info
        if (isset($productData['variants']) && !empty($productData['variants'])) {
            $variantCount = count($productData['variants']);
            $bulletPoints[] = "Available in {$variantCount} variant" . ($variantCount > 1 ? 's' : '');
        }

        // Add dimensions if available
        if (isset($productData['dimensions'])) {
            $bulletPoints[] = "Dimensions: {$productData['dimensions']}";
        }

        return array_slice($bulletPoints, 0, 8); // Limit to 8 bullet points
    }

    /**
     * Generate SEO metadata.
     */
    private function generateSeoMetadata(array $productData, string $draftTitle, ?array $brandTone = null): array
    {
        $name = $productData['product_name'] ?? 'Product';
        $category = $productData['category'] ?? 'product';
        $brand = $productData['brand'] ?? null;

        // Generate meta description (155 chars max)
        $metaDescription = "Shop {$name}";

        if ($brand) {
            $metaDescription .= " from {$brand}";
        }

        $metaDescription .= ". {$this->generateCategoryContext($category, $name)}";

        // Trim to SEO-friendly length
        if (strlen($metaDescription) > 155) {
            $metaDescription = substr($metaDescription, 0, 152) . '...';
        }

        // Generate keywords
        $keywords = array_filter([
            $name,
            $brand,
            $category,
            strtolower($category),
        ]);

        // Add variant keywords if available
        if (isset($productData['variants']) && is_array($productData['variants'])) {
            foreach (array_slice($productData['variants'], 0, 3) as $variant) {
                if (isset($variant['attributes']) && is_array($variant['attributes'])) {
                    foreach ($variant['attributes'] as $attr) {
                        $keywords[] = $attr;
                    }
                }
            }
        }

        return [
            'meta_title' => strlen($draftTitle) > 60 ? substr($draftTitle, 0, 57) . '...' : $draftTitle,
            'meta_description' => $metaDescription,
            'keywords' => array_unique(array_slice($keywords, 0, 10)),
            'og_title' => $draftTitle,
            'og_description' => $metaDescription
        ];
    }

    /**
     * Apply brand tone to content.
     */
    private function applyBrandTone(string $content, array $brandTone): string
    {
        // This is a simplified version - in production, this would use more sophisticated NLP
        $tone = $brandTone['tone'] ?? 'professional';

        switch (strtolower($tone)) {
            case 'casual':
                // Make content more casual
                $content = str_replace('Discover', 'Check out', $content);
                $content = str_replace('offers', 'has', $content);
                break;

            case 'luxury':
                // Make content more premium
                $content = str_replace('Discover', 'Experience', $content);
                $content = str_replace('great', 'exceptional', $content);
                $content = str_replace('good', 'exquisite', $content);
                break;

            case 'playful':
                // Make content more fun
                $content = str_replace('Discover', 'Meet', $content);
                break;

            case 'professional':
            default:
                // Keep professional tone (default)
                break;
        }

        return $content;
    }

    /**
     * Generate batch content for multiple products.
     */
    public function generateBatchContent(array $products, ?array $brandTone = null): array
    {
        $generatedContent = [];
        $failedProducts = [];

        foreach ($products as $product) {
            try {
                $sku = $product['sku'] ?? 'unknown';
                $generatedContent[$sku] = $this->generateProductContent($product, $brandTone);
            } catch (\Exception $e) {
                $failedProducts[] = [
                    'sku' => $product['sku'] ?? 'unknown',
                    'error' => $e->getMessage()
                ];
            }
        }

        return [
            'generated_content' => $generatedContent,
            'total_processed' => count($products),
            'successful' => count($generatedContent),
            'failed' => count($failedProducts),
            'failed_products' => $failedProducts,
            'draft_status' => 'DRAFT – REQUIRES HUMAN APPROVAL',
            'generated_at' => now()->toDateTimeString()
        ];
    }

    /**
     * Validate generated content meets minimum requirements.
     */
    public function validateContent(array $content): array
    {
        $validation = [
            'valid' => true,
            'issues' => []
        ];

        // Validate title
        if (empty($content['draft_title'])) {
            $validation['valid'] = false;
            $validation['issues'][] = 'Title is missing';
        } elseif (strlen($content['draft_title']) < 10) {
            $validation['issues'][] = 'Title is too short (minimum 10 characters recommended)';
        }

        // Validate description
        if (empty($content['draft_description'])) {
            $validation['valid'] = false;
            $validation['issues'][] = 'Description is missing';
        } elseif (strlen($content['draft_description']) < 50) {
            $validation['issues'][] = 'Description is too short (minimum 50 characters recommended)';
        }

        // Validate bullet points
        if (empty($content['bullet_points'])) {
            $validation['issues'][] = 'No bullet points generated';
        } elseif (count($content['bullet_points']) < 3) {
            $validation['issues'][] = 'Fewer than 3 bullet points (minimum 3 recommended)';
        }

        return $validation;
    }
}
