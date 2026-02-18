<?php

namespace App\Ai\Tools;

use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Stringable;

class ValidateImagesTool implements Tool
{
    public function description(): string
    {
        return 'Validate product images for resolution, format, and generate draft alt-text. Provides recommendations for image optimization without modifying original files.';
    }

    public function handle(Request $request): Stringable|string
    {
        $images = $request['images'] ?? [];
        $validationRules = $request['validation_rules'] ?? [];
        $generateAltText = $request['generate_alt_text'] ?? true;

        // Default validation rules
        $minWidth = $validationRules['min_width'] ?? 800;
        $minHeight = $validationRules['min_height'] ?? 600;
        $maxFileSize = $validationRules['max_file_size_mb'] ?? 5.0;
        $allowedFormats = $validationRules['allowed_formats'] ?? ['jpg', 'jpeg', 'png', 'webp'];

        $validatedImages = [];
        $issues = [];
        $totalIssues = 0;

        foreach ($images as $index => $image) {
            $imageUrl = $image['url'] ?? '';
            $filename = $image['filename'] ?? "image_{$index}";
            $productName = $image['product_name'] ?? 'Product';
            $currentAltText = $image['current_alt_text'] ?? '';
            $imageType = $image['image_type'] ?? 'primary';

            $validation = [
                'image_index' => $index,
                'filename' => $filename,
                'product_name' => $productName,
                'image_type' => $imageType,
                'url' => $imageUrl,
                'draft_status' => 'DRAFT – REQUIRES HUMAN APPROVAL',
                'validation_results' => [],
                'recommendations' => [],
            ];

            // Simulate image validation (in real implementation, would analyze actual images)
            $imageIssues = $this->simulateImageValidation($imageUrl, $filename, $minWidth, $minHeight, $maxFileSize, $allowedFormats);
            
            $validation['validation_results'] = $imageIssues;
            $validation['is_valid'] = empty($imageIssues);

            if (!empty($imageIssues)) {
                $totalIssues += count($imageIssues);
                $issues = array_merge($issues, $imageIssues);
                
                // Generate recommendations based on issues
                $validation['recommendations'] = $this->generateRecommendations($imageIssues);
            }

            // Generate draft alt-text if requested
            if ($generateAltText) {
                $validation['generated_alt_text'] = $this->generateAltText($productName, $imageType, $currentAltText);
            }

            // Generate filename recommendations
            $validation['recommended_filename'] = $this->generateFilenameRecommendation($productName, $imageType, $filename);

            $validatedImages[] = $validation;
        }

        $results = [
            'success' => true,
            'draft_status' => 'DRAFT – REQUIRES HUMAN APPROVAL',
            'validation_summary' => [
                'total_images' => count($images),
                'valid_images' => count(array_filter($validatedImages, fn($img) => $img['is_valid'])),
                'images_with_issues' => count(array_filter($validatedImages, fn($img) => !$img['is_valid'])),
                'total_issues_found' => $totalIssues,
                'validation_timestamp' => now()->toDateTimeString(),
                'validation_rules' => [
                    'min_dimensions' => "{$minWidth}x{$minHeight}",
                    'max_file_size' => "{$maxFileSize}MB",
                    'allowed_formats' => implode(', ', $allowedFormats)
                ]
            ],
            'validated_images' => $validatedImages,
            'all_issues' => $issues,
            'next_steps' => [
                'Review validation results for each image',
                'Address resolution and format issues',
                'Approve generated alt-text for SEO compliance',
                'Implement recommended filename conventions',
                'No original images are modified - all changes require manual implementation'
            ]
        ];

        return json_encode($results, JSON_PRETTY_PRINT);
    }

    private function simulateImageValidation(string $imageUrl, string $filename, int $minWidth, int $minHeight, float $maxFileSize, array $allowedFormats): array
    {
        $issues = [];

        // Simulate format validation
        $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
        if (!in_array($extension, $allowedFormats)) {
            $issues[] = "Unsupported format: .{$extension}. Allowed: " . implode(', ', $allowedFormats);
        }

        // Simulate dimension validation (randomly for demo)
        if (rand(1, 5) === 1) {
            $issues[] = "Image resolution may be below minimum {$minWidth}x{$minHeight}px";
        }

        // Simulate file size validation (randomly for demo)
        if (rand(1, 8) === 1) {
            $issues[] = "File size may exceed {$maxFileSize}MB limit";
        }

        // Check for missing alt text indicators
        if (strpos(strtolower($filename), 'image') === 0 || is_numeric(basename($filename, '.' . $extension))) {
            $issues[] = "Filename not descriptive for SEO";
        }

        return $issues;
    }

    private function generateRecommendations(array $issues): array
    {
        $recommendations = [];

        foreach ($issues as $issue) {
            if (strpos($issue, 'format') !== false) {
                $recommendations[] = "Convert image to JPEG or WebP format for better compatibility";
            } elseif (strpos($issue, 'resolution') !== false) {
                $recommendations[] = "Resize image to meet minimum dimension requirements";
            } elseif (strpos($issue, 'file size') !== false) {
                $recommendations[] = "Compress image to reduce file size while maintaining quality";
            } elseif (strpos($issue, 'filename') !== false) {
                $recommendations[] = "Use descriptive filenames with product name and keywords";
            }
        }

        return array_unique($recommendations);
    }

    private function generateAltText(string $productName, string $imageType, string $currentAltText): string
    {
        if ($currentAltText && strlen($currentAltText) > 10) {
            return "[Enhanced] " . $currentAltText . " [DRAFT]";
        }

        switch ($imageType) {
            case 'primary':
                return "{$productName} - Main product image [DRAFT ALT-TEXT]";
            case 'detail':
                return "Close-up detail view of {$productName} [DRAFT ALT-TEXT]";
            case 'lifestyle':
                return "{$productName} in use - Lifestyle image [DRAFT ALT-TEXT]";
            case 'secondary':
                return "{$productName} - Additional view [DRAFT ALT-TEXT]";
            default:
                return "{$productName} product image [DRAFT ALT-TEXT]";
        }
    }

    private function generateFilenameRecommendation(string $productName, string $imageType, string $currentFilename): string
    {
        $extension = strtolower(pathinfo($currentFilename, PATHINFO_EXTENSION));
        $cleanProductName = preg_replace('/[^a-zA-Z0-9]/', '-', strtolower($productName));
        $cleanProductName = trim($cleanProductName, '-');

        switch ($imageType) {
            case 'primary':
                return "{$cleanProductName}-main.{$extension}";
            case 'detail':
                return "{$cleanProductName}-detail.{$extension}";
            case 'lifestyle':
                return "{$cleanProductName}-lifestyle.{$extension}";
            case 'secondary':
                return "{$cleanProductName}-alt.{$extension}";
            default:
                return "{$cleanProductName}.{$extension}";
        }
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'images' => $schema
                ->array()
                ->description('Array of image data to validate')
                ->required(),
            'validation_rules' => $schema
                ->object()
                ->description('Validation rules for images'),
            'generate_alt_text' => $schema
                ->boolean()
                ->description('Whether to generate draft alt-text for images')
                ->default(true),
        ];
    }
}