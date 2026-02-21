<?php

namespace App\Services\Portal;

use App\Models\PortalTenant;

/**
 * Step 8: Brand Kit Usage and Update Rules
 *
 * All agents must reference the latest version of the Brand Kit at runtime.
 * This service provides a standardized way to inject Brand Kit context into agent prompts.
 */
class BrandKitInjectionService
{
    /**
     * Get Brand Kit context formatted for agent prompts.
     *
     * Returns a formatted string containing company information, brand tone,
     * colors, and other Brand Kit data that agents should use in their responses.
     *
     * @param  bool  $includeTitle  Whether to include a "BRAND KIT" title section
     * @return string Formatted Brand Kit context ready for injection into agent prompts
     */
    public function getFormattedContext(PortalTenant $tenant, bool $includeTitle = true): string
    {
        $settings = $tenant->settings ?? [];
        $companyName = $tenant->company_name ?? null;
        $industry = $settings['industry'] ?? null;
        $brandTone = $settings['brand_tone'] ?? null;
        $brandColors = $settings['brand_colors'] ?? null;
        $businessDescription = $settings['business_description'] ?? null;
        $servicesNeeded = $settings['services_needed'] ?? null;
        $website = $settings['website'] ?? null;

        $context = '';

        if ($includeTitle) {
            $context .= "\n=== BRAND KIT (Updated: {$tenant->updated_at->format('Y-m-d')}) ===\n";
        }

        if ($companyName) {
            $context .= "Company: {$companyName}\n";
        }

        if ($industry) {
            $context .= "Industry: {$industry}\n";
        }

        if ($businessDescription) {
            $context .= "Business Description: {$businessDescription}\n";
        }

        if ($website) {
            $context .= "Website: {$website}\n";
        }

        if ($servicesNeeded) {
            $context .= "Services/Focus Areas: {$servicesNeeded}\n";
        }

        if ($brandTone) {
            $context .= "Brand Tone: {$brandTone}\n";
            $context .= "IMPORTANT: Use this brand tone in all content, messages, and communications.\n";
        }

        if ($brandColors) {
            $context .= "Brand Colors: {$brandColors}\n";
            $context .= "IMPORTANT: Reference these colors when generating visuals or design recommendations.\n";
        }

        // Add brand assets info if available
        $brandAssets = $settings['brand_assets'] ?? [];
        if (! empty($brandAssets)) {
            $assetCount = count($brandAssets);
            $context .= "\nBrand Assets Available: {$assetCount} file(s) uploaded\n";

            $assetTypes = collect($brandAssets)->pluck('type')->unique()->implode(', ');
            if ($assetTypes) {
                $context .= "Asset Types: {$assetTypes}\n";
            }
        }

        if ($includeTitle && ! empty(trim($context))) {
            $context .= "==============================================\n";
        }

        return $context;
    }

    /**
     * Get a compact Brand Kit summary (for tight token budgets).
     *
     * @return string Minimal brand context
     */
    public function getCompactContext(PortalTenant $tenant): string
    {
        $settings = $tenant->settings ?? [];
        $parts = [];

        if ($tenant->company_name) {
            $parts[] = "Company: {$tenant->company_name}";
        }

        if (! empty($settings['brand_tone'])) {
            $parts[] = "Tone: {$settings['brand_tone']}";
        }

        if (! empty($settings['industry'])) {
            $parts[] = "Industry: {$settings['industry']}";
        }

        return empty($parts) ? '' : '[Brand Kit: '.implode(' | ', $parts).']';
    }

    /**
     * Check if Brand Kit has minimum required data.
     *
     * @return bool True if Brand Kit has at least company name and one other field
     */
    public function hasMinimumData(PortalTenant $tenant): bool
    {
        $settings = $tenant->settings ?? [];

        if (empty($tenant->company_name)) {
            return false;
        }

        // Must have at least one of these in addition to company name
        return ! empty($settings['brand_tone'])
            || ! empty($settings['industry'])
            || ! empty($settings['business_description']);
    }

    /**
     * Get Brand Kit data as an associative array.
     *
     * @return array<string, mixed>
     */
    public function getData(PortalTenant $tenant): array
    {
        $settings = $tenant->settings ?? [];

        return [
            'company_name' => $tenant->company_name,
            'industry' => $settings['industry'] ?? null,
            'business_description' => $settings['business_description'] ?? null,
            'brand_tone' => $settings['brand_tone'] ?? null,
            'brand_colors' => $settings['brand_colors'] ?? null,
            'services_needed' => $settings['services_needed'] ?? null,
            'website' => $settings['website'] ?? null,
            'brand_assets' => $settings['brand_assets'] ?? [],
            'updated_at' => $tenant->updated_at,
        ];
    }
}
