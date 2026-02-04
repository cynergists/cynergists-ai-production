<?php

namespace App\Services\SeoEngine;

use App\Models\PortalTenant;
use App\Models\SeoAudit;
use App\Models\SeoChange;
use App\Models\SeoRecommendation;
use App\Models\SeoRecommendationApproval;
use App\Models\SeoReport;
use App\Models\SeoSite;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SeoEngineMockIngestor
{
    /**
     * @return array{seeded: bool, sites: int, audits: int, recommendations: int, approvals: int, changes: int, reports: int, reason?: string}
     */
    public function ingestForTenant(PortalTenant $tenant, User $user, bool $force = false): array
    {
        $existingCount = SeoSite::query()->where('tenant_id', $tenant->id)->count();
        if ($existingCount > 0 && ! $force) {
            return [
                'seeded' => false,
                'sites' => $existingCount,
                'audits' => 0,
                'recommendations' => 0,
                'approvals' => 0,
                'changes' => 0,
                'reports' => 0,
                'reason' => 'existing',
            ];
        }

        return DB::transaction(function () use ($tenant, $user, $force) {
            if ($force) {
                $this->purgeTenant($tenant);
            }

            $counts = [
                'seeded' => true,
                'sites' => 0,
                'audits' => 0,
                'recommendations' => 0,
                'approvals' => 0,
                'changes' => 0,
                'reports' => 0,
            ];

            $now = now();

            $counts = $this->mergeCounts($counts, $this->seedSite(
                tenant: $tenant,
                user: $user,
                sitePayload: [
                    'name' => 'Cynergists HQ',
                    'url' => 'https://cynergists.ai',
                    'status' => 'active',
                    'settings' => [
                        'industry' => 'SaaS',
                        'locations' => ['Austin', 'Miami', 'Remote'],
                    ],
                ],
                auditPayloads: [
                    'completed' => [
                        'status' => 'completed',
                        'trigger' => 'scheduled',
                        'issues_count' => 14,
                        'metrics' => [
                            'health_score' => 78,
                            'pages_scanned' => 214,
                            'core_web_vitals' => 'needs_improvement',
                            'index_coverage' => '96%',
                            'ai_visibility' => 'growing',
                        ],
                        'summary' => 'Core Web Vitals are the top blocker for ranking growth. Schema coverage needs expansion.',
                        'started_at' => $now->copy()->subDays(3)->subHours(2),
                        'completed_at' => $now->copy()->subDays(3),
                    ],
                    'running' => [
                        'status' => 'running',
                        'trigger' => 'manual',
                        'issues_count' => 5,
                        'metrics' => [
                            'pages_scanned' => 62,
                            'ai_visibility' => 'monitoring',
                        ],
                        'summary' => 'Live crawl in progress for newly published landing pages.',
                        'started_at' => $now->copy()->subHours(5),
                        'completed_at' => null,
                    ],
                ],
                recommendations: [
                    [
                        'audit' => 'completed',
                        'type' => 'technical',
                        'title' => 'Resolve redirect chains across priority landing pages',
                        'description' => 'Simplify multi-hop redirects to improve crawl efficiency and page speed scores.',
                        'target_pages' => ['/solutions/seo-engine', '/products/seo-engine', '/platform'],
                        'impact_score' => 86,
                        'effort' => 'medium',
                        'status' => 'pending',
                        'metadata' => [
                            'category' => 'crawl_efficiency',
                            'estimated_hours' => 6,
                            'expected_gain' => '+8% crawl budget',
                        ],
                    ],
                    [
                        'audit' => 'completed',
                        'type' => 'performance',
                        'title' => 'Improve LCP performance on the Carbon landing page',
                        'description' => 'Compress hero imagery and preload critical fonts to reduce LCP below 2.5s.',
                        'target_pages' => ['/products/seo-engine'],
                        'impact_score' => 74,
                        'effort' => 'medium',
                        'status' => 'approved',
                        'approved_at' => $now->copy()->subDays(1),
                        'metadata' => [
                            'category' => 'core_web_vitals',
                            'estimated_hours' => 4,
                            'expected_gain' => '+12 health score',
                        ],
                        'approval' => [
                            'decision' => 'approved',
                            'notes' => 'Prioritize before the next release window.',
                            'decided_at' => $now->copy()->subDays(1),
                        ],
                    ],
                    [
                        'audit' => 'running',
                        'type' => 'schema',
                        'title' => 'Add FAQ schema to the GEO/AEO service page',
                        'description' => 'Structured FAQ data will improve AI answer engine visibility and rich results.',
                        'target_pages' => ['/services/geo-aeo'],
                        'impact_score' => 69,
                        'effort' => 'low',
                        'status' => 'applied',
                        'approved_at' => $now->copy()->subDays(5),
                        'applied_at' => $now->copy()->subDays(3),
                        'metadata' => [
                            'category' => 'structured_data',
                            'estimated_hours' => 2,
                            'expected_gain' => '+3 AI answers',
                        ],
                        'approval' => [
                            'decision' => 'approved',
                            'notes' => 'Ship with the next content batch.',
                            'decided_at' => $now->copy()->subDays(5),
                        ],
                        'change' => [
                            'status' => 'applied',
                            'summary' => 'Inserted FAQ schema with 6 Q&A entries on /services/geo-aeo.',
                            'diff' => [
                                'page' => '/services/geo-aeo',
                                'before' => 'No FAQ schema',
                                'after' => 'FAQ schema with 6 questions',
                            ],
                            'metadata' => [
                                'deployment' => 'automated',
                                'validated' => true,
                            ],
                            'applied_at' => $now->copy()->subDays(3),
                        ],
                    ],
                ],
                reports: [
                    [
                        'period_start' => $now->copy()->subMonthNoOverflow()->startOfMonth()->toDateString(),
                        'period_end' => $now->copy()->subMonthNoOverflow()->endOfMonth()->toDateString(),
                        'status' => 'ready',
                        'highlights' => [
                            'health_score' => 82,
                            'keyword_lift' => '+12',
                            'ai_presence' => '6 new answers',
                            'local_visibility' => '+4%',
                        ],
                        'metrics' => [
                            'organic_sessions' => 12840,
                            'ranked_keywords' => 412,
                            'average_position' => 14.2,
                            'local_pack_wins' => 9,
                        ],
                    ],
                ]
            ));

            $counts = $this->mergeCounts($counts, $this->seedSite(
                tenant: $tenant,
                user: $user,
                sitePayload: [
                    'name' => 'Summit Dental Group',
                    'url' => 'https://summitdentalgroup.com',
                    'status' => 'active',
                    'settings' => [
                        'industry' => 'Healthcare',
                        'locations' => ['Denver', 'Boulder'],
                    ],
                ],
                auditPayloads: [
                    'completed' => [
                        'status' => 'completed',
                        'trigger' => 'scheduled',
                        'issues_count' => 9,
                        'metrics' => [
                            'health_score' => 72,
                            'pages_scanned' => 96,
                            'local_pack_visibility' => '82%',
                            'reviews_tracking' => 'enabled',
                            'ai_visibility' => 'emerging',
                        ],
                        'summary' => 'Local landing pages need stronger content depth and consistent NAP markup.',
                        'started_at' => $now->copy()->subDays(4)->subHours(3),
                        'completed_at' => $now->copy()->subDays(4),
                    ],
                    'running' => [
                        'status' => 'running',
                        'trigger' => 'scheduled',
                        'issues_count' => 3,
                        'metrics' => [
                            'pages_scanned' => 22,
                            'local_pack_visibility' => 'monitoring',
                        ],
                        'summary' => 'Weekly crawl focused on location schema coverage.',
                        'started_at' => $now->copy()->subHours(7),
                        'completed_at' => null,
                    ],
                ],
                recommendations: [
                    [
                        'audit' => 'completed',
                        'type' => 'local',
                        'title' => 'Correct NAP inconsistencies on location pages',
                        'description' => 'Standardize the clinic name, address, and phone across all location pages.',
                        'target_pages' => ['/locations/denver', '/locations/boulder'],
                        'impact_score' => 92,
                        'effort' => 'low',
                        'status' => 'pending',
                        'metadata' => [
                            'category' => 'local_seo',
                            'estimated_hours' => 2,
                            'expected_gain' => '+6 local pack wins',
                        ],
                    ],
                    [
                        'audit' => 'completed',
                        'type' => 'content',
                        'title' => 'Expand service area pages with local proof points',
                        'description' => 'Add 250-300 words plus testimonials to boost geo relevance.',
                        'target_pages' => ['/services/cleanings', '/services/implants'],
                        'impact_score' => 77,
                        'effort' => 'medium',
                        'status' => 'approved',
                        'approved_at' => $now->copy()->subDays(2),
                        'metadata' => [
                            'category' => 'content_depth',
                            'estimated_hours' => 5,
                            'expected_gain' => '+11% geo reach',
                        ],
                        'approval' => [
                            'decision' => 'approved',
                            'notes' => 'Coordinate with the content team for imagery.',
                            'decided_at' => $now->copy()->subDays(2),
                        ],
                    ],
                    [
                        'audit' => 'running',
                        'type' => 'ai_visibility',
                        'title' => 'Publish dentist Q&A schema for AI answer engines',
                        'description' => 'Answer engine optimization with structured Q&A on the FAQ hub.',
                        'target_pages' => ['/faq'],
                        'impact_score' => 65,
                        'effort' => 'low',
                        'status' => 'applied',
                        'approved_at' => $now->copy()->subDays(6),
                        'applied_at' => $now->copy()->subDays(4),
                        'metadata' => [
                            'category' => 'aeo',
                            'estimated_hours' => 3,
                            'expected_gain' => '+4 AI citations',
                        ],
                        'approval' => [
                            'decision' => 'approved',
                            'notes' => 'Publish alongside the new FAQ content block.',
                            'decided_at' => $now->copy()->subDays(6),
                        ],
                        'change' => [
                            'status' => 'applied',
                            'summary' => 'Added Q&A schema with 8 dentist responses on /faq.',
                            'diff' => [
                                'page' => '/faq',
                                'before' => 'FAQ content without schema',
                                'after' => 'FAQ schema with 8 entries',
                            ],
                            'metadata' => [
                                'deployment' => 'manual',
                                'validated' => true,
                            ],
                            'applied_at' => $now->copy()->subDays(4),
                        ],
                    ],
                ],
                reports: [
                    [
                        'period_start' => $now->copy()->subMonthNoOverflow()->startOfMonth()->toDateString(),
                        'period_end' => $now->copy()->subMonthNoOverflow()->endOfMonth()->toDateString(),
                        'status' => 'ready',
                        'highlights' => [
                            'health_score' => 76,
                            'keyword_lift' => '+8',
                            'ai_presence' => '3 new answers',
                            'local_visibility' => '+7%',
                        ],
                        'metrics' => [
                            'organic_sessions' => 4820,
                            'ranked_keywords' => 186,
                            'average_position' => 18.6,
                            'local_pack_wins' => 14,
                        ],
                    ],
                ]
            ));

            return $counts;
        });
    }

    private function seedSite(
        PortalTenant $tenant,
        User $user,
        array $sitePayload,
        array $auditPayloads,
        array $recommendations,
        array $reports,
    ): array {
        $counts = [
            'sites' => 0,
            'audits' => 0,
            'recommendations' => 0,
            'approvals' => 0,
            'changes' => 0,
            'reports' => 0,
        ];

        $site = SeoSite::query()->create(array_merge([
            'tenant_id' => $tenant->id,
            'user_id' => (string) $user->id,
            'tracking_id' => (string) Str::uuid(),
            'last_audit_at' => null,
            'pixel_install_method' => 'manual',
            'pixel_install_status' => 'pending',
            'pixel_last_seen_at' => null,
        ], $sitePayload));

        $counts['sites']++;

        $audits = [];
        foreach ($auditPayloads as $key => $payload) {
            $audits[$key] = SeoAudit::query()->create(array_merge([
                'seo_site_id' => $site->id,
            ], $payload));
            $counts['audits']++;
        }

        if (isset($audits['completed']) && $audits['completed'] instanceof SeoAudit) {
            $site->update([
                'last_audit_at' => $audits['completed']->completed_at,
            ]);
        }

        foreach ($recommendations as $payload) {
            $auditKey = $payload['audit'] ?? null;
            $audit = $auditKey && isset($audits[$auditKey]) ? $audits[$auditKey] : null;
            $defaultAudit = $audits['completed'] ?? reset($audits) ?: null;

            if (! $defaultAudit) {
                continue;
            }

            $recommendation = SeoRecommendation::query()->create(array_merge([
                'seo_site_id' => $site->id,
                'seo_audit_id' => $audit?->id ?? $defaultAudit->id,
                'type' => 'technical',
                'impact_score' => 0,
                'effort' => 'medium',
                'status' => 'pending',
            ], array_diff_key($payload, array_flip(['audit', 'approval', 'change']))));

            $counts['recommendations']++;

            if (isset($payload['approval']) && is_array($payload['approval'])) {
                SeoRecommendationApproval::query()->create(array_merge([
                    'seo_recommendation_id' => $recommendation->id,
                    'user_id' => (string) $user->id,
                    'decision' => $payload['approval']['decision'] ?? 'approved',
                    'notes' => $payload['approval']['notes'] ?? null,
                    'decided_at' => $payload['approval']['decided_at'] ?? null,
                ], array_diff_key($payload['approval'], array_flip(['decision', 'notes', 'decided_at']))));

                $counts['approvals']++;
            }

            if (isset($payload['change']) && is_array($payload['change'])) {
                SeoChange::query()->create(array_merge([
                    'seo_site_id' => $site->id,
                    'seo_recommendation_id' => $recommendation->id,
                    'status' => $payload['change']['status'] ?? 'applied',
                    'summary' => $payload['change']['summary'] ?? null,
                    'diff' => $payload['change']['diff'] ?? null,
                    'metadata' => $payload['change']['metadata'] ?? null,
                    'applied_at' => $payload['change']['applied_at'] ?? null,
                ], array_diff_key($payload['change'], array_flip(['status', 'summary', 'diff', 'metadata', 'applied_at']))));

                $counts['changes']++;
            }
        }

        foreach ($reports as $payload) {
            SeoReport::query()->create(array_merge([
                'seo_site_id' => $site->id,
                'status' => 'ready',
            ], $payload));

            $counts['reports']++;
        }

        return $counts;
    }

    /**
     * @param  array{seeded: bool, sites: int, audits: int, recommendations: int, approvals: int, changes: int, reports: int}  $base
     * @param  array{sites: int, audits: int, recommendations: int, approvals: int, changes: int, reports: int}  $add
     * @return array{seeded: bool, sites: int, audits: int, recommendations: int, approvals: int, changes: int, reports: int}
     */
    private function mergeCounts(array $base, array $add): array
    {
        foreach (['sites', 'audits', 'recommendations', 'approvals', 'changes', 'reports'] as $key) {
            $base[$key] += $add[$key] ?? 0;
        }

        return $base;
    }

    private function purgeTenant(PortalTenant $tenant): void
    {
        $siteIds = SeoSite::query()->where('tenant_id', $tenant->id)->pluck('id');

        if ($siteIds->isEmpty()) {
            return;
        }

        $recommendationIds = SeoRecommendation::query()
            ->whereIn('seo_site_id', $siteIds)
            ->pluck('id');

        SeoRecommendationApproval::query()
            ->whereIn('seo_recommendation_id', $recommendationIds)
            ->delete();

        SeoChange::query()->whereIn('seo_site_id', $siteIds)->delete();
        SeoRecommendation::query()->whereIn('seo_site_id', $siteIds)->delete();
        SeoAudit::query()->whereIn('seo_site_id', $siteIds)->delete();
        SeoReport::query()->whereIn('seo_site_id', $siteIds)->delete();
        SeoSite::query()->whereIn('id', $siteIds)->delete();
    }
}
