<?php

namespace App\Ai\Tools;

use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Stringable;

class GenerateContentTool implements Tool
{
    public function description(): string
    {
        return 'Generate draft product content including titles, descriptions, and bullet points. All content is draft-only and requires human approval before use.';
    }

    public function handle(Request $request): Stringable|string
    {
        $products = $request['products'] ?? [];
        $contentTypes = $request['content_types'] ?? ['title', 'description', 'bullet_points'];
        $tone = $request['tone'] ?? 'professional';
        $maxLength = $request['max_length'] ?? [];

        $generatedContent = [];

        foreach ($products as $index => $product) {
            $productName = $product['name'] ?? "Product {$index}";
            $category = $product['category'] ?? 'General';
            $existingDescription = $product['description'] ?? '';
            $features = $product['features'] ?? [];
            $brand = $product['brand'] ?? '';

            $content = [
                'product_index' => $index,
                'original_name' => $productName,
                'draft_status' => 'DRAFT – REQUIRES HUMAN APPROVAL',
                'generated_content' => [],
            ];

            // Generate title
            if (in_array('title', $contentTypes)) {
                $content['generated_content']['title'] = $this->generateTitle($productName, $brand, $tone);
            }

            // Generate description
            if (in_array('description', $contentTypes)) {
                $content['generated_content']['description'] = $this->generateDescription(
                    $productName, 
                    $category, 
                    $existingDescription, 
                    $features, 
                    $tone,
                    $maxLength['description'] ?? 500
                );
            }

            // Generate bullet points
            if (in_array('bullet_points', $contentTypes)) {
                $content['generated_content']['bullet_points'] = $this->generateBulletPoints(
                    $productName, 
                    $category, 
                    $features, 
                    $maxLength['bullet_points'] ?? 5
                );
            }

            // Generate meta description
            if (in_array('meta_description', $contentTypes)) {
                $content['generated_content']['meta_description'] = $this->generateMetaDescription(
                    $productName, 
                    $category, 
                    $brand
                );
            }

            $generatedContent[] = $content;
        }

        $results = [
            'success' => true,
            'draft_status' => 'DRAFT – REQUIRES HUMAN APPROVAL',
            'generation_summary' => [
                'total_products' => count($products),
                'content_types_generated' => $contentTypes,
                'tone' => $tone,
                'generation_timestamp' => now()->toDateTimeString(),
            ],
            'generated_content' => $generatedContent,
            'approval_required' => 'All generated content must be reviewed and approved by a human before use in any storefront or marketing materials.',
            'next_steps' => [
                'Review all generated titles for brand alignment',
                'Verify product descriptions for accuracy',
                'Validate bullet points match actual product features',
                'Approve content for export to your content management system'
            ]
        ];

        return json_encode($results, JSON_PRETTY_PRINT);
    }

    private function generateTitle(string $productName, string $brand, string $tone): string
    {
        // Simulate title generation based on tone
        $prefix = $brand ? "{$brand} " : '';
        
        switch ($tone) {
            case 'luxury':
                return $prefix . "Premium " . $productName;
            case 'technical':
                return $prefix . "Professional " . $productName;
            case 'casual':
                return $prefix . $productName . " - Perfect for Everyday Use";
            default:
                return $prefix . $productName;
        }
    }

    private function generateDescription(string $productName, string $category, string $existing, array $features, string $tone, int $maxLength): string
    {
        if ($existing && strlen($existing) > 50) {
            return "Enhanced: " . substr($existing, 0, $maxLength - 20) . " [DRAFT - Generated enhancement]";
        }

        $baseDescription = "Experience the quality and reliability of {$productName}. ";
        
        if ($features) {
            $baseDescription .= "Key features include: " . implode(', ', array_slice($features, 0, 3)) . ". ";
        }

        switch ($tone) {
            case 'luxury':
                $baseDescription .= "Crafted with premium materials for discerning customers.";
                break;
            case 'technical':
                $baseDescription .= "Engineered for optimal performance and durability.";
                break;
            case 'casual':
                $baseDescription .= "Perfect for everyday use with style and comfort.";
                break;
            default:
                $baseDescription .= "Designed to meet your needs with quality and value.";
        }

        return substr($baseDescription, 0, $maxLength) . " [DRAFT - Generated content]";
    }

    private function generateBulletPoints(string $productName, string $category, array $features, int $maxPoints): array
    {
        $bulletPoints = [];
        
        if ($features) {
            foreach (array_slice($features, 0, $maxPoints - 1) as $feature) {
                $bulletPoints[] = "• " . $feature . " [DRAFT]";
            }
        } else {
            // Generate generic bullet points
            $bulletPoints[] = "• High-quality construction [DRAFT]";
            $bulletPoints[] = "• Reliable performance [DRAFT]";
            $bulletPoints[] = "• Suitable for " . strtolower($category) . " applications [DRAFT]";
        }

        $bulletPoints[] = "• Backed by quality assurance [DRAFT]";

        return array_slice($bulletPoints, 0, $maxPoints);
    }

    private function generateMetaDescription(string $productName, string $category, string $brand): string
    {
        $brandText = $brand ? " from {$brand}" : "";
        return "Discover {$productName}{$brandText}. Quality {$category} products with reliable performance. [DRAFT - Generated meta]";
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'products' => $schema
                ->array()
                ->description('Array of product data to generate content for')
                ->required(),
            'content_types' => $schema
                ->array()
                ->description('Types of content to generate')
                ->default(['title', 'description', 'bullet_points']),
            'tone' => $schema
                ->string()
                ->description('Content tone and style')
                ->enum(['professional', 'casual', 'luxury', 'technical'])
                ->default('professional'),
            'max_length' => $schema
                ->object()
                ->description('Maximum length constraints for content types'),
        ];
    }
}