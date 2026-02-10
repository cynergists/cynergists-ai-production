<?php

namespace App\Services\Mosaic;

use Illuminate\Support\Str;

class MosaicBlueprintService
{
    /**
     * @param  array<string, string>  $answers
     * @param  array<int, array<string, mixed>>  $assets
     * @return array<string, mixed>
     */
    public function generate(array $answers, array $assets = []): array
    {
        $businessName = $answers['business_name'] ?? 'Your Business';
        $businessDescription = $answers['business_description'] ?? '';
        $primaryGoal = $answers['primary_goal'] ?? '';
        $targetAudience = $answers['target_audience'] ?? '';
        $offerings = $this->parseList($answers['offerings'] ?? '');
        $brandTone = $answers['brand_tone'] ?? '';
        $primaryCta = $answers['primary_cta'] ?? '';
        $domainRaw = $answers['domain'] ?? '';
        $formDestination = $answers['form_destination'] ?? '';
        $aiVisuals = strtolower(trim($answers['ai_visuals'] ?? 'no'));
        $aiVisualsApproved = in_array($aiVisuals, ['yes', 'y', 'approved'], true);

        $pages = $this->normalizePages($this->parseList($answers['sitemap'] ?? ''));
        $pages = $this->ensureUniqueTemplates($pages);

        return [
            'version' => 1,
            'generated_at' => now()->toIso8601String(),
            'site' => [
                'name' => $businessName,
                'domain' => $this->normalizeDomain($domainRaw),
                'primary_goal' => $primaryGoal,
                'target_audience' => $targetAudience,
                'brand_tone' => $brandTone,
                'primary_cta' => $primaryCta,
            ],
            'sitemap' => array_map(fn (array $page): array => [
                'title' => $page['title'],
                'slug' => $page['slug'],
            ], $pages),
            'pages' => array_map(
                fn (array $page): array => $this->buildPageConfig(
                    $page,
                    $businessName,
                    $businessDescription,
                    $primaryGoal,
                    $targetAudience,
                    $offerings,
                    $primaryCta
                ),
                $pages
            ),
            'footer' => $this->buildFooterConfig($businessName, $pages, $primaryCta),
            'forms' => [
                'primary' => [
                    'destination' => $formDestination,
                    'success_message' => 'Thanks for reaching out. We will follow up shortly.',
                ],
            ],
            'cta_variations' => $this->buildCtaVariations($primaryCta),
            'media' => [
                'use_ai_generated' => $aiVisualsApproved,
                'assets' => $assets,
            ],
            'integrations' => [
                'analytics' => [
                    'provider' => 'placeholder',
                    'tracking_id' => null,
                    'configured' => false,
                ],
            ],
            'performance_budgets' => [
                'max_image_kb' => 350,
                'max_script_kb' => 200,
                'max_animation_ms' => 400,
                'lcp_ms' => 2500,
                'cls_max' => 0.1,
            ],
            'accessibility' => [
                'min_contrast_ratio' => 4.5,
                'heading_hierarchy_required' => true,
                'alt_text_required' => true,
                'min_tap_target_px' => 44,
            ],
            'interactions' => [
                'scroll_reveal' => true,
                'reduce_motion_respects_prefers' => true,
            ],
            'deployment' => [
                'environment' => 'preview',
                'production_approved' => false,
                'preview_url' => null,
                'production_url' => null,
                'approved_by' => null,
                'approved_at' => null,
            ],
        ];
    }

    /**
     * @return array<int, string>
     */
    private function parseList(string $raw): array
    {
        $normalized = trim($raw);
        if ($normalized === '') {
            return [];
        }

        if (! str_contains($normalized, ',') && str_contains($normalized, ' and ')) {
            $normalized = str_replace(' and ', ',', $normalized);
        }

        $normalized = str_replace([';', "\n", "\r"], ',', $normalized);

        $items = array_filter(array_map('trim', explode(',', $normalized)), fn (string $item): bool => $item !== '');

        return array_values(array_unique($items));
    }

    /**
     * @param  array<int, string>  $pages
     * @return array<int, array{title: string, slug: string, template: string}>
     */
    private function normalizePages(array $pages): array
    {
        $normalized = [];

        foreach ($pages as $page) {
            $title = Str::of($page)->trim()->replace(['/', '_'], ' ')->title()->toString();
            if ($title === '') {
                continue;
            }

            $slug = Str::slug($title);
            if ($slug === '') {
                continue;
            }

            if (array_key_exists($slug, $normalized)) {
                continue;
            }

            $normalized[$slug] = [
                'title' => $title,
                'slug' => $slug,
                'template' => $this->resolveTemplate($slug),
            ];
        }

        return $this->prioritizeHome(array_values($normalized));
    }

    /**
     * @param  array<int, array{title: string, slug: string, template: string}>  $pages
     * @return array<int, array{title: string, slug: string, template: string}>
     */
    private function prioritizeHome(array $pages): array
    {
        usort($pages, function (array $a, array $b): int {
            if ($a['slug'] === 'home') {
                return -1;
            }

            if ($b['slug'] === 'home') {
                return 1;
            }

            return strcmp($a['title'], $b['title']);
        });

        return $pages;
    }

    private function resolveTemplate(string $slug): string
    {
        return match ($slug) {
            'home' => 'home-hero',
            'about' => 'about-story',
            'services' => 'services-list',
            'products' => 'product-grid',
            'contact' => 'contact-form',
            'faq' => 'faq-list',
            default => 'standard-page',
        };
    }

    /**
     * @param  array<int, array{title: string, slug: string, template: string}>  $pages
     * @return array<int, array{title: string, slug: string, template: string, layout_id: string}>
     */
    private function ensureUniqueTemplates(array $pages): array
    {
        return array_map(function (array $page): array {
            $page['layout_id'] = $page['slug'].'-layout';

            return $page;
        }, $pages);
    }

    /**
     * @param  array{title: string, slug: string, template: string, layout_id?: string}  $page
     * @param  array<int, string>  $offerings
     * @return array<string, mixed>
     */
    private function buildPageConfig(
        array $page,
        string $businessName,
        string $businessDescription,
        string $primaryGoal,
        string $targetAudience,
        array $offerings,
        string $primaryCta
    ): array {
        $sections = match ($page['slug']) {
            'home' => [
                $this->section('hero', [
                    'headline' => trim("{$businessName} — {$primaryGoal}"),
                    'subheadline' => $businessDescription,
                    'primary_cta' => $primaryCta,
                ]),
                $this->section('trust-signals', [
                    'items' => [
                        ['icon' => 'shield', 'text' => 'Trusted by clients'],
                        ['icon' => 'clock', 'text' => 'Fast response time'],
                        ['icon' => 'check', 'text' => 'Quality guaranteed'],
                    ],
                ]),
                $this->section('offerings', [
                    'headline' => 'What we offer',
                    'items' => $offerings,
                ]),
                $this->section('audience', [
                    'headline' => 'Who this is for',
                    'body' => $targetAudience,
                ]),
                $this->section('testimonials', [
                    'headline' => 'What clients say',
                    'items' => [
                        [
                            'quote' => "Working with {$businessName} was a great decision.",
                            'author' => 'Client Testimonial',
                            'role' => 'Verified Customer',
                        ],
                    ],
                ]),
                $this->section('cta', [
                    'headline' => $primaryCta,
                    'supporting_text' => 'We will respond quickly with the next steps.',
                ]),
            ],
            'about' => [
                $this->section('story', [
                    'headline' => "About {$businessName}",
                    'body' => $businessDescription,
                ]),
                $this->section('values', [
                    'headline' => 'What we value',
                    'items' => [
                        'Clarity in communication',
                        'Reliable delivery',
                        'Respect for your time',
                    ],
                ]),
                $this->section('cta', [
                    'headline' => $primaryCta,
                    'supporting_text' => 'Let us know how we can help.',
                ]),
            ],
            'services', 'products' => [
                $this->section('listing', [
                    'headline' => $page['slug'] === 'products' ? 'Products' : 'Services',
                    'items' => $offerings,
                ]),
                $this->section('process', [
                    'headline' => 'How it works',
                    'steps' => [
                        'Share your goals',
                        'Review the plan',
                        'Launch with confidence',
                    ],
                ]),
                $this->section('cta', [
                    'headline' => $primaryCta,
                    'supporting_text' => 'Tell us what you need and we will take it from there.',
                ]),
            ],
            'contact' => [
                $this->section('contact-form', [
                    'headline' => 'Contact',
                    'description' => 'Tell us about your project and we will reply soon.',
                    'form_id' => 'primary',
                ]),
                $this->section('faq', [
                    'headline' => 'Frequently asked questions',
                    'items' => [
                        [
                            'question' => "What does {$businessName} do?",
                            'answer' => $businessDescription,
                        ],
                        [
                            'question' => 'Who do you work with?',
                            'answer' => $targetAudience,
                        ],
                        [
                            'question' => 'How do I get started?',
                            'answer' => "Simply {$primaryCta} and we will guide you through the process.",
                        ],
                        [
                            'question' => 'What is your response time?',
                            'answer' => 'We typically respond within one business day.',
                        ],
                        [
                            'question' => 'Can I see examples of your work?',
                            'answer' => 'Absolutely. Contact us and we will share relevant case studies.',
                        ],
                    ],
                ]),
            ],
            default => [
                $this->section('content', [
                    'headline' => $page['title'],
                    'body' => $businessDescription,
                ]),
                $this->section('cta', [
                    'headline' => $primaryCta,
                    'supporting_text' => 'Let us know how we can help.',
                ]),
            ],
        };

        return [
            'title' => $page['title'],
            'slug' => $page['slug'],
            'template' => $page['template'],
            'layout_id' => $page['layout_id'] ?? ($page['slug'].'-layout'),
            'sections' => $sections,
        ];
    }

    /**
     * @param  array<string, mixed>  $content
     * @return array<string, mixed>
     */
    private function section(string $type, array $content): array
    {
        return [
            'type' => $type,
            'content' => $content,
        ];
    }

    private function normalizeDomain(string $domain): ?string
    {
        $trimmed = trim($domain);
        if ($trimmed === '' || str_starts_with(strtolower($trimmed), 'no domain')) {
            return null;
        }

        $normalized = preg_replace('#^https?://#', '', $trimmed);
        $normalized = rtrim($normalized ?? '', '/');

        return $normalized !== '' ? $normalized : null;
    }

    /**
     * @param  array<int, array{title: string, slug: string}>  $pages
     * @return array<string, mixed>
     */
    private function buildFooterConfig(string $businessName, array $pages, string $primaryCta): array
    {
        return [
            'company_name' => $businessName,
            'tagline' => 'Quality service, delivered with care.',
            'navigation' => [
                'primary' => array_map(fn (array $page): array => [
                    'label' => $page['title'],
                    'href' => $page['slug'] === 'home' ? '/' : '/'.$page['slug'],
                ], array_slice($pages, 0, 5)),
            ],
            'legal' => [
                ['label' => 'Privacy Policy', 'href' => '/privacy'],
                ['label' => 'Terms of Service', 'href' => '/terms'],
            ],
            'cta' => $primaryCta,
            'copyright' => "© {year} {$businessName}. All rights reserved.",
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function buildCtaVariations(string $primaryCta): array
    {
        return [
            'primary' => [
                'text' => $primaryCta,
                'style' => 'primary',
            ],
            'secondary' => [
                'text' => 'Learn more',
                'style' => 'secondary',
            ],
            'footer' => [
                'text' => $primaryCta,
                'style' => 'outline',
            ],
        ];
    }
}
