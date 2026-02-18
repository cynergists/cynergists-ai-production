<?php

namespace App\Services\Mosaic;

class MosaicValidationService
{
    /**
     * Validate blueprint configuration against performance budgets and accessibility rules.
     *
     * @param  array<string, mixed>  $config
     * @return array{valid: bool, errors: array<string>, warnings: array<string>}
     */
    public function validateConfig(array $config): array
    {
        $errors = [];
        $warnings = [];

        // Validate performance budgets
        $performanceResults = $this->validatePerformanceBudgets($config);
        $errors = array_merge($errors, $performanceResults['errors']);
        $warnings = array_merge($warnings, $performanceResults['warnings']);

        // Validate accessibility requirements
        $accessibilityResults = $this->validateAccessibility($config);
        $errors = array_merge($errors, $accessibilityResults['errors']);
        $warnings = array_merge($warnings, $accessibilityResults['warnings']);

        // Validate structure
        $structureResults = $this->validateStructure($config);
        $errors = array_merge($errors, $structureResults['errors']);
        $warnings = array_merge($warnings, $structureResults['warnings']);

        return [
            'valid' => count($errors) === 0,
            'errors' => $errors,
            'warnings' => $warnings,
        ];
    }

    /**
     * @param  array<string, mixed>  $config
     * @return array{errors: array<string>, warnings: array<string>}
     */
    private function validatePerformanceBudgets(array $config): array
    {
        $errors = [];
        $warnings = [];

        $budgets = $config['performance_budgets'] ?? [];

        // Check if media assets exceed budgets
        if (isset($config['media']['assets']) && is_array($config['media']['assets'])) {
            foreach ($config['media']['assets'] as $asset) {
                if (isset($asset['size_kb'])) {
                    $sizeKb = (int) $asset['size_kb'];
                    $type = $asset['type'] ?? 'unknown';

                    if ($type === 'image' && $sizeKb > ($budgets['max_image_kb'] ?? 350)) {
                        $warnings[] = "Image asset exceeds budget: {$sizeKb}KB (max: {$budgets['max_image_kb']}KB)";
                    }
                }
            }
        }

        // Validate LCP and CLS targets are set
        if (! isset($budgets['lcp_ms'])) {
            $warnings[] = 'LCP target not defined in performance budgets';
        }

        if (! isset($budgets['cls_max'])) {
            $warnings[] = 'CLS target not defined in performance budgets';
        }

        return compact('errors', 'warnings');
    }

    /**
     * @param  array<string, mixed>  $config
     * @return array{errors: array<string>, warnings: array<string>}
     */
    private function validateAccessibility(array $config): array
    {
        $errors = [];
        $warnings = [];

        $a11y = $config['accessibility'] ?? [];

        // Validate contrast ratio
        if (isset($a11y['min_contrast_ratio']) && $a11y['min_contrast_ratio'] < 4.5) {
            $warnings[] = 'Minimum contrast ratio below WCAG AA standard (4.5:1)';
        }

        // Validate heading hierarchy requirement
        if (! ($a11y['heading_hierarchy_required'] ?? true)) {
            $warnings[] = 'Heading hierarchy enforcement is disabled';
        }

        // Validate alt text requirement
        if (! ($a11y['alt_text_required'] ?? true)) {
            $errors[] = 'Alt text requirement is disabled - violates accessibility standards';
        }

        // Validate tap target size
        if (isset($a11y['min_tap_target_px']) && $a11y['min_tap_target_px'] < 44) {
            $warnings[] = 'Minimum tap target size below recommended 44px for mobile accessibility';
        }

        return compact('errors', 'warnings');
    }

    /**
     * @param  array<string, mixed>  $config
     * @return array{errors: array<string>, warnings: array<string>}
     */
    private function validateStructure(array $config): array
    {
        $errors = [];
        $warnings = [];

        // Validate required top-level keys
        $requiredKeys = ['version', 'site', 'pages', 'footer', 'deployment'];
        foreach ($requiredKeys as $key) {
            if (! isset($config[$key])) {
                $errors[] = "Missing required configuration key: {$key}";
            }
        }

        // Validate sitemap has home page
        if (isset($config['sitemap']) && is_array($config['sitemap'])) {
            $hasHome = false;
            foreach ($config['sitemap'] as $page) {
                if (($page['slug'] ?? '') === 'home') {
                    $hasHome = true;
                    break;
                }
            }

            if (! $hasHome) {
                $errors[] = 'Sitemap must include a home page';
            }
        }

        // Validate no duplicate slugs
        if (isset($config['pages']) && is_array($config['pages'])) {
            $slugs = array_map(fn ($page) => $page['slug'] ?? '', $config['pages']);
            $uniqueSlugs = array_unique($slugs);

            if (count($slugs) !== count($uniqueSlugs)) {
                $errors[] = 'Duplicate page slugs detected in configuration';
            }
        }

        // Validate form destination if forms exist
        if (isset($config['forms']['primary']['destination'])) {
            $destination = $config['forms']['primary']['destination'];
            if (empty($destination) || ! filter_var($destination, FILTER_VALIDATE_EMAIL)) {
                $warnings[] = 'Form destination email may be invalid or missing';
            }
        }

        return compact('errors', 'warnings');
    }

    /**
     * Validate media asset against performance thresholds.
     *
     * @param  array<string, mixed>  $asset
     * @return array{valid: bool, warnings: array<string>}
     */
    public function validateMediaAsset(array $asset): array
    {
        $warnings = [];
        $sizeKb = $asset['size_kb'] ?? 0;
        $type = $asset['type'] ?? 'unknown';

        if ($type === 'image' && $sizeKb > 350) {
            $warnings[] = "Image exceeds recommended size: {$sizeKb}KB (max: 350KB)";
        }

        if ($type === 'video') {
            $sizeMb = $sizeKb / 1024;
            if ($sizeMb > 50) {
                $warnings[] = "Video exceeds recommended size: {$sizeMb}MB (max: 50MB)";
            }
        }

        return [
            'valid' => count($warnings) === 0,
            'warnings' => $warnings,
        ];
    }
}
