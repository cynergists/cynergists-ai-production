<?php

namespace App\Jobs;

use App\Models\SeoAudit;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RunSeoAuditJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $backoff = 60;

    public function __construct(
        public SeoAudit $audit
    ) {}

    public function handle(): void
    {
        $this->audit->update([
            'status' => 'running',
            'started_at' => now(),
        ]);

        try {
            $site = $this->audit->site;

            $results = $this->performAudit($site->url);

            $this->audit->update([
                'status' => 'completed',
                'metrics' => $results['metrics'],
                'issues_count' => $results['issues_count'],
                'summary' => $results['summary'],
                'completed_at' => now(),
            ]);

            $site->update([
                'last_audit_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('SEO audit failed', [
                'audit_id' => $this->audit->id,
                'error' => $e->getMessage(),
            ]);

            $this->audit->update([
                'status' => 'failed',
                'summary' => 'Audit failed: '.$e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Perform the SEO audit for the given URL.
     *
     * @return array{metrics: array, issues_count: int, summary: string}
     */
    private function performAudit(string $url): array
    {
        $metrics = [
            'health_score' => 0,
            'pages_scanned' => 0,
            'issues' => [],
        ];

        $issues = [];
        $pagesScanned = 0;

        try {
            $response = Http::timeout(30)->get($url);
            $pagesScanned = 1;
            $body = $response->body();
            $healthScore = 100;

            // Check HTTP status
            if (! $response->successful()) {
                $issues[] = [
                    'id' => 'http_error',
                    'title' => "Site returned HTTP {$response->status()}",
                    'priority' => 'high',
                    'type' => 'technical',
                ];
                $healthScore -= 30;
            }

            // Check for meta title
            if (! preg_match('/<title[^>]*>(.+?)<\/title>/is', $body, $titleMatch)) {
                $issues[] = [
                    'id' => 'missing_title',
                    'title' => 'Missing page title tag',
                    'priority' => 'high',
                    'type' => 'on_page',
                ];
                $healthScore -= 15;
            } elseif (strlen($titleMatch[1]) > 60) {
                $issues[] = [
                    'id' => 'long_title',
                    'title' => 'Page title exceeds 60 characters',
                    'priority' => 'medium',
                    'type' => 'on_page',
                ];
                $healthScore -= 5;
            }

            // Check for meta description
            if (! preg_match('/<meta[^>]*name=["\']description["\'][^>]*content=["\'](.+?)["\']/is', $body)) {
                $issues[] = [
                    'id' => 'missing_meta_description',
                    'title' => 'Missing meta description',
                    'priority' => 'high',
                    'type' => 'on_page',
                ];
                $healthScore -= 15;
            }

            // Check for H1 tag
            if (! preg_match('/<h1[^>]*>/i', $body)) {
                $issues[] = [
                    'id' => 'missing_h1',
                    'title' => 'Missing H1 heading tag',
                    'priority' => 'high',
                    'type' => 'on_page',
                ];
                $healthScore -= 10;
            }

            // Check for SSL
            if (! str_starts_with($url, 'https://')) {
                $issues[] = [
                    'id' => 'no_ssl',
                    'title' => 'Site does not use HTTPS',
                    'priority' => 'high',
                    'type' => 'technical',
                ];
                $healthScore -= 20;
            }

            // Check for viewport meta
            if (! preg_match('/<meta[^>]*name=["\']viewport["\']/i', $body)) {
                $issues[] = [
                    'id' => 'missing_viewport',
                    'title' => 'Missing viewport meta tag (mobile-friendliness)',
                    'priority' => 'medium',
                    'type' => 'technical',
                ];
                $healthScore -= 10;
            }

            // Check for canonical tag
            if (! preg_match('/<link[^>]*rel=["\']canonical["\']/i', $body)) {
                $issues[] = [
                    'id' => 'missing_canonical',
                    'title' => 'Missing canonical link tag',
                    'priority' => 'medium',
                    'type' => 'on_page',
                ];
                $healthScore -= 5;
            }

            // Check for Open Graph tags
            if (! preg_match('/<meta[^>]*property=["\']og:/i', $body)) {
                $issues[] = [
                    'id' => 'missing_og_tags',
                    'title' => 'Missing Open Graph meta tags',
                    'priority' => 'low',
                    'type' => 'on_page',
                ];
                $healthScore -= 3;
            }

            // Check response time
            $transferTime = $response->transferStats?->getTransferTime() ?? 0;
            if ($transferTime > 3.0) {
                $issues[] = [
                    'id' => 'slow_response',
                    'title' => 'Slow server response time (>3s)',
                    'priority' => 'high',
                    'type' => 'performance',
                ];
                $healthScore -= 10;
            } elseif ($transferTime > 1.5) {
                $issues[] = [
                    'id' => 'moderate_response',
                    'title' => 'Moderate server response time (>1.5s)',
                    'priority' => 'medium',
                    'type' => 'performance',
                ];
                $healthScore -= 5;
            }

            $metrics = [
                'health_score' => max(0, $healthScore),
                'pages_scanned' => $pagesScanned,
                'response_time' => round($transferTime, 2),
                'issues' => $issues,
            ];
        } catch (\Exception $e) {
            $metrics = [
                'health_score' => 0,
                'pages_scanned' => 0,
                'issues' => [
                    [
                        'id' => 'unreachable',
                        'title' => 'Site is unreachable: '.$e->getMessage(),
                        'priority' => 'high',
                        'type' => 'technical',
                    ],
                ],
            ];
            $issues = $metrics['issues'];
        }

        $issueCount = count($issues);
        $highCount = collect($issues)->where('priority', 'high')->count();

        $summary = "Scanned {$pagesScanned} page(s). Found {$issueCount} issue(s)";
        if ($highCount > 0) {
            $summary .= " ({$highCount} high priority)";
        }
        $summary .= '. Health score: '.($metrics['health_score'] ?? 0).'%.';

        return [
            'metrics' => $metrics,
            'issues_count' => $issueCount,
            'summary' => $summary,
        ];
    }
}
