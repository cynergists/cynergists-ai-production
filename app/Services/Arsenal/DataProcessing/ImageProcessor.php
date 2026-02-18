<?php

namespace App\Services\Arsenal\DataProcessing;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ImageProcessor
{
    /**
     * Process and validate product images.
     */
    public function processImages(array $imageUrls, string $productSku): array
    {
        try {
            $processedImages = [];

            foreach ($imageUrls as $index => $imageUrl) {
                $processedImages[] = $this->processImage($imageUrl, $productSku, $index);
            }

            return [
                'processed_images' => $processedImages,
                'image_summary' => $this->generateImageSummary($processedImages),
                'recommendations' => $this->generateRecommendations($processedImages),
                'draft_status' => 'DRAFT – REQUIRES HUMAN APPROVAL'
            ];
        } catch (\Exception $e) {
            Log::error('Image processing failed: ' . $e->getMessage());
            throw new \Exception('Image processing failed: ' . $e->getMessage());
        }
    }

    /**
     * Process a single image.
     */
    private function processImage(string $imageUrl, string $productSku, int $index): array
    {
        $processed = [
            'original_url' => $imageUrl,
            'index' => $index,
            'validation' => [],
            'recommendations' => []
        ];

        // Validate image resolution (if accessible)
        $resolution = $this->validateImageResolution($imageUrl);
        $processed['resolution'] = $resolution;

        if ($resolution) {
            if ($resolution['width'] < 800 || $resolution['height'] < 800) {
                $processed['validation'][] = 'low_resolution';
                $processed['recommendations'][] = 'Image resolution below 800x800px - recommend higher resolution for better display';
            }
        }

        // Check filename structure
        $filename = basename(parse_url($imageUrl, PHP_URL_PATH));
        $processed['original_filename'] = $filename;

        // Generate recommended filename
        $processed['recommended_filename'] = $this->generateRecommendedFilename($productSku, $index);

        if (!$this->hasProperFilename($filename)) {
            $processed['validation'][] = 'improper_filename';
            $processed['recommendations'][] = 'Filename not optimized for SEO - recommend: ' . $processed['recommended_filename'];
        }

        // Generate draft alt text
        $processed['draft_alt_text'] = $this->generateDraftAltText($productSku, $index);

        // Check if alt text exists
        $processed['missing_alt_text'] = true; // Assume missing unless provided
        $processed['recommendations'][] = 'Alt text missing - draft generated: "' . $processed['draft_alt_text'] . '"';

        // Determine image status
        $processed['status'] = empty($processed['validation']) ? 'ready' : 'needs_attention';

        return $processed;
    }

    /**
     * Validate image resolution.
     */
    private function validateImageResolution(string $imageUrl): ?array
    {
        try {
            // For remote URLs, attempt to get image size
            if (filter_var($imageUrl, FILTER_VALIDATE_URL)) {
                $imageData = @getimagesize($imageUrl);

                if ($imageData !== false) {
                    return [
                        'width' => $imageData[0],
                        'height' => $imageData[1],
                        'type' => $imageData['mime']
                    ];
                }
            }

            // For local storage paths
            if (Storage::exists($imageUrl)) {
                $fullPath = Storage::path($imageUrl);
                $imageData = @getimagesize($fullPath);

                if ($imageData !== false) {
                    return [
                        'width' => $imageData[0],
                        'height' => $imageData[1],
                        'type' => $imageData['mime']
                    ];
                }
            }

            return null;
        } catch (\Exception $e) {
            Log::warning('Could not validate image resolution: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Check if filename follows best practices.
     */
    private function hasProperFilename(string $filename): bool
    {
        // Good filename should be lowercase, use hyphens, and be descriptive
        $hasLowercase = strtolower($filename) === $filename;
        $hasHyphens = str_contains($filename, '-');
        $hasDescriptive = strlen(pathinfo($filename, PATHINFO_FILENAME)) > 10;

        return $hasLowercase && $hasHyphens && $hasDescriptive;
    }

    /**
     * Generate recommended filename.
     */
    private function generateRecommendedFilename(string $productSku, int $index): string
    {
        $cleanSku = strtolower(preg_replace('/[^a-zA-Z0-9]/', '-', $productSku));
        $imagePosition = $index === 0 ? 'main' : 'view-' . ($index + 1);

        return "{$cleanSku}-{$imagePosition}.jpg";
    }

    /**
     * Generate draft alt text.
     */
    private function generateDraftAltText(string $productSku, int $index): string
    {
        $position = $index === 0 ? 'main product image' : 'product image view ' . ($index + 1);

        return "Product {$productSku} - {$position}";
    }

    /**
     * Generate image processing summary.
     */
    private function generateImageSummary(array $processedImages): array
    {
        $readyCount = count(array_filter($processedImages, fn($img) => $img['status'] === 'ready'));
        $needsAttention = count($processedImages) - $readyCount;

        $validationIssues = [];
        foreach ($processedImages as $image) {
            if (!empty($image['validation'])) {
                foreach ($image['validation'] as $issue) {
                    $validationIssues[$issue] = ($validationIssues[$issue] ?? 0) + 1;
                }
            }
        }

        return [
            'total_images' => count($processedImages),
            'ready_images' => $readyCount,
            'images_needing_attention' => $needsAttention,
            'common_issues' => $validationIssues,
            'processing_timestamp' => now()->toDateTimeString()
        ];
    }

    /**
     * Generate overall recommendations.
     */
    private function generateRecommendations(array $processedImages): array
    {
        $recommendations = [];

        // Check for missing angles
        if (count($processedImages) < 3) {
            $recommendations[] = 'Consider adding more product angles (recommended: 3-5 images minimum)';
        }

        // Check for consistency issues
        $resolutions = array_filter(array_column($processedImages, 'resolution'));
        if (count($resolutions) > 1) {
            $widths = array_column($resolutions, 'width');
            if (max($widths) - min($widths) > 200) {
                $recommendations[] = 'Image resolutions vary significantly - consider standardizing for consistency';
            }
        }

        // Check for low resolution images
        $lowResCount = count(array_filter($processedImages, fn($img) => in_array('low_resolution', $img['validation'] ?? [])));
        if ($lowResCount > 0) {
            $recommendations[] = "{$lowResCount} image(s) below recommended 800x800px resolution";
        }

        return $recommendations;
    }

    /**
     * Validate image format and readiness for storefront.
     */
    public function validateImageReadiness(string $imageUrl): array
    {
        $validation = [
            'url_accessible' => false,
            'proper_format' => false,
            'adequate_resolution' => false,
            'recommendations' => []
        ];

        // Check URL accessibility
        $validation['url_accessible'] = $this->isUrlAccessible($imageUrl);

        if (!$validation['url_accessible']) {
            $validation['recommendations'][] = 'Image URL is not accessible - verify URL is public';
            return $validation;
        }

        // Check format
        $format = $this->getImageFormat($imageUrl);
        $validation['format'] = $format;
        $validation['proper_format'] = in_array($format, ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);

        if (!$validation['proper_format']) {
            $validation['recommendations'][] = 'Image format not optimal - recommend JPEG, PNG, or WebP';
        }

        // Check resolution
        $resolution = $this->validateImageResolution($imageUrl);
        if ($resolution) {
            $validation['adequate_resolution'] = ($resolution['width'] >= 800 && $resolution['height'] >= 800);

            if (!$validation['adequate_resolution']) {
                $validation['recommendations'][] = 'Image resolution below 800x800px - recommend higher resolution';
            }
        }

        $validation['overall_status'] =
            $validation['url_accessible'] &&
            $validation['proper_format'] &&
            $validation['adequate_resolution'] ? 'ready' : 'needs_attention';

        return $validation;
    }

    /**
     * Check if URL is accessible.
     */
    private function isUrlAccessible(string $url): bool
    {
        try {
            if (!filter_var($url, FILTER_VALIDATE_URL)) {
                return false;
            }

            $headers = @get_headers($url);
            return $headers && str_contains($headers[0], '200');
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Get image format/mime type.
     */
    private function getImageFormat(string $imageUrl): ?string
    {
        try {
            $resolution = $this->validateImageResolution($imageUrl);
            return $resolution['type'] ?? null;
        } catch (\Exception $e) {
            return null;
        }
    }
}
