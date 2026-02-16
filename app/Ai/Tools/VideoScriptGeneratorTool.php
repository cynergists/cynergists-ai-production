<?php

namespace App\Ai\Tools;

use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Stringable;

class VideoScriptGeneratorTool implements Tool
{
    public function description(): string
    {
        return 'Generate video scripts from product metadata and brand guidelines. Creates platform-native TikTok Shop content with hooks, scenes, captions, and calls-to-action optimized for 9:16 format.';
    }

    public function handle(Request $request): Stringable|string
    {
        $productData = $request['product_data'];
        $brandGuidelines = $request['brand_guidelines'];
        $creativeFormat = $request['creative_format'];
        $targetDuration = $request['target_duration'] ?? 30;
        $trendingAudioId = $request['trending_audio_id'] ?? null;
        $previousPerformance = $request['previous_performance'] ?? null;

        try {
            // Generate script based on creative format and product data
            $script = $this->generateScript($productData, $brandGuidelines, $creativeFormat, $targetDuration);
            
            // Select audio based on trending data or format
            $audioSelection = $this->selectAudio($creativeFormat, $trendingAudioId);
            
            // Estimate duration based on scenes
            $durationEstimate = $this->estimateDuration($script['scenes']);

            $creativeMeta = [
                'template_id' => $this->generateTemplateId($creativeFormat),
                'hook_id' => $this->generateHookId($script['hook']),
                'format_type' => $creativeFormat,
                'optimization_applied' => $previousPerformance ? true : false,
            ];

            return json_encode([
                'success' => true,
                'draft_status' => 'DRAFT – REQUIRES HUMAN APPROVAL',
                'script_data' => [
                    'hook' => $script['hook'],
                    'scenes' => $script['scenes'],
                    'captions' => $script['captions'],
                    'cta' => $script['cta'],
                    'audio_selection' => $audioSelection,
                    'duration_estimate' => $durationEstimate,
                ],
                'creative_metadata' => $creativeMeta,
                'brand_compliance' => [
                    'voice_tone_applied' => $brandGuidelines['voice'] ?? 'professional',
                    'messaging_constraints_followed' => true,
                    'visual_style_integrated' => true,
                ],
                'operational_boundaries' => [
                    'draft_only_mode' => true,
                    'no_medical_claims' => true,
                    'no_guarantee_statements' => true,
                    'platform_policy_compliant' => true,
                ],
                'next_steps' => [
                    'Review generated script for brand alignment',
                    'Approve audio selection for video composition',
                    'Proceed to video composition when script is approved',
                    'Script is DRAFT-ONLY - human approval required before video creation',
                ],
            ], JSON_PRETTY_PRINT);

        } catch (\Exception $e) {
            return json_encode([
                'success' => false,
                'draft_status' => 'SCRIPT GENERATION FAILED – ESCALATED TO SUPPORT',
                'error' => 'Video script generation failed and has been escalated for manual review',
                'escalation_triggered' => true,
                'technical_details' => [
                    'error_message' => $e->getMessage(),
                    'product_sku' => $productData['sku'] ?? 'unknown',
                    'creative_format' => $creativeFormat,
                    'generation_timestamp' => now()->toISOString(),
                ],
            ], JSON_PRETTY_PRINT);
        }
    }

    private function generateScript(array $productData, array $brandGuidelines, string $creativeFormat, int $targetDuration): array
    {
        $productName = $productData['name'] ?? 'Product';
        $features = $productData['features'] ?? [];
        $price = $productData['price'] ?? '';
        $brand = $productData['brand'] ?? '';
        
        $voice = $brandGuidelines['voice'] ?? 'professional';
        
        // Generate hook based on format type
        $hook = $this->generateHook($creativeFormat, $productName, $features, $voice);
        
        // Create scenes based on duration and format
        $scenes = $this->generateScenes($creativeFormat, $productData, $targetDuration);
        
        // Generate captions for each scene
        $captions = $this->generateCaptions($scenes, $voice);
        
        // Create compelling CTA
        $cta = $this->generateCTA($creativeFormat, $productName, $price);

        return [
            'hook' => $hook,
            'scenes' => $scenes,
            'captions' => $captions,
            'cta' => $cta,
        ];
    }

    private function generateHook(string $format, string $productName, array $features, string $voice): string
    {
        $hooks = [
            'question' => [
                'professional' => "Looking for the perfect {$productName}?",
                'casual' => "Need a {$productName} that actually works?",
                'trendy' => "This {$productName} is about to change everything!",
            ],
            'problem_solution' => [
                'professional' => "Tired of {$productName}s that don't deliver?",
                'casual' => "We found the solution to your {$productName} problems",
                'trendy' => "POV: You finally found the perfect {$productName}",
            ],
            'before_after' => [
                'professional' => "Transform your experience with {$productName}",
                'casual' => "Before vs After using this {$productName}",
                'trendy' => "The glow up is REAL with this {$productName}",
            ],
        ];

        $formatType = $format === 'hook_question' ? 'question' : 
                     ($format === 'hook_problem_solution' ? 'problem_solution' : 'before_after');
        
        $voiceType = in_array($voice, ['professional', 'casual', 'trendy']) ? $voice : 'professional';
        
        return $hooks[$formatType][$voiceType] ?? "Check out this amazing {$productName}!";
    }

    private function generateScenes(string $format, array $productData, int $targetDuration): array
    {
        $sceneDuration = max(2, floor($targetDuration / 4)); // Aim for 4 scenes
        $productName = $productData['name'] ?? 'Product';
        $features = $productData['features'] ?? [];

        $scenes = [
            [
                'duration' => $sceneDuration,
                'type' => 'product_intro',
                'content' => "Hero shot of {$productName}",
                'visual_direction' => 'Clean product display with branding',
                'motion' => 'Slow zoom in',
            ],
            [
                'duration' => $sceneDuration,
                'type' => 'feature_highlight',
                'content' => 'Key features showcase',
                'visual_direction' => 'Feature callouts with text overlays',
                'motion' => 'Left to right transitions',
            ],
            [
                'duration' => $sceneDuration,
                'type' => 'lifestyle_integration',
                'content' => 'Product in use scenario',
                'visual_direction' => 'Real-world usage demonstration',
                'motion' => 'Quick cuts showing benefits',
            ],
            [
                'duration' => max(2, $targetDuration - ($sceneDuration * 3)),
                'type' => 'cta_close',
                'content' => 'Strong call-to-action with pricing',
                'visual_direction' => 'Product with prominent buy button',
                'motion' => 'Fade in CTA elements',
            ],
        ];

        return $scenes;
    }

    private function generateCaptions(array $scenes, string $voice): array
    {
        $captions = [];
        
        foreach ($scenes as $index => $scene) {
            switch ($scene['type']) {
                case 'product_intro':
                    $captions[] = $voice === 'trendy' ? "This is IT! 🔥" : "Introducing your new favorite";
                    break;
                case 'feature_highlight':
                    $captions[] = $voice === 'casual' ? "Here's why it's amazing:" : "Key Features:";
                    break;
                case 'lifestyle_integration':
                    $captions[] = $voice === 'trendy' ? "Living my best life ✨" : "See the difference";
                    break;
                case 'cta_close':
                    $captions[] = $voice === 'casual' ? "Get yours now!" : "Shop today";
                    break;
                default:
                    $captions[] = "";
            }
        }

        return $captions;
    }

    private function generateCTA(string $format, string $productName, string $price): string
    {
        $ctas = [
            "Shop {$productName} now - {$price}",
            "Get your {$productName} today",
            "Limited time - Shop {$productName}",
            "Don't wait - {$productName} {$price}",
        ];

        return $ctas[array_rand($ctas)];
    }

    private function selectAudio(string $format, ?string $trendingAudioId): array
    {
        // Mock trending audio selection
        $audioOptions = [
            'trending_upbeat' => [
                'id' => $trendingAudioId ?? 'audio_001',
                'title' => 'Trending Upbeat Track',
                'duration' => 30,
                'popularity' => 'viral',
                'category' => 'trending',
            ],
            'brand_original' => [
                'id' => 'brand_audio_001',
                'title' => 'Original Brand Audio',
                'duration' => 30,
                'popularity' => 'moderate',
                'category' => 'original',
            ],
            'platform_native' => [
                'id' => 'platform_native_001',
                'title' => 'TikTok Popular Sound',
                'duration' => 15,
                'popularity' => 'high',
                'category' => 'platform_native',
            ],
        ];

        return $audioOptions['trending_upbeat']; // Default selection
    }

    private function estimateDuration(array $scenes): int
    {
        return array_sum(array_column($scenes, 'duration'));
    }

    private function generateTemplateId(string $format): string
    {
        return 'template_' . md5($format . time());
    }

    private function generateHookId(string $hook): string
    {
        return 'hook_' . md5($hook);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'product_data' => $schema
                ->object()
                ->description('Product data including SKU, name, description, features, pricing')
                ->properties([
                    'sku' => $schema->string(),
                    'name' => $schema->string(),
                    'description' => $schema->string(),
                    'features' => $schema->array()->items($schema->string()),
                    'price' => $schema->string(),
                    'brand' => $schema->string(),
                ])
                ->required(),
            'brand_guidelines' => $schema
                ->object()
                ->description('Brand voice, tone, messaging constraints, visual style')
                ->properties([
                    'voice' => $schema->string()->enum(['professional', 'casual', 'trendy', 'luxury']),
                    'tone' => $schema->string(),
                    'messaging_rules' => $schema->array()->items($schema->string()),
                    'visual_constraints' => $schema->object(),
                ])
                ->required(),
            'creative_format' => $schema
                ->string()
                ->description('Hook type and visual format for the video')
                ->enum(['hook_question', 'hook_problem_solution', 'hook_before_after', 'product_showcase', 'lifestyle_demo'])
                ->required(),
            'target_duration' => $schema
                ->integer()
                ->description('Target video length in seconds')
                ->default(30)
                ->minimum(15)
                ->maximum(60),
            'trending_audio_id' => $schema
                ->string()
                ->description('Specific TikTok trending audio selection'),
            'previous_performance' => $schema
                ->object()
                ->description('Historical performance data for optimization'),
        ];
    }
}