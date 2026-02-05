<?php

namespace App\Http\Controllers\Api\Portal;

use App\Http\Controllers\Controller;
use App\Http\Requests\Portal\DecideSeoRecommendationRequest;
use App\Http\Requests\Portal\GenerateSeoReportRequest;
use App\Http\Requests\Portal\StoreSeoSiteRequest;
use App\Http\Requests\Portal\UpdateSeoPixelInstallRequest;
use App\Models\PortalTenant;
use App\Models\SeoChange;
use App\Models\SeoRecommendation;
use App\Models\SeoRecommendationApproval;
use App\Models\SeoReport;
use App\Models\SeoSite;
use App\Services\SeoEngine\SeoEngineMockIngestor;
use App\Services\SeoEngine\SeoReportGenerator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class PortalSeoController extends Controller
{
    public function overview(Request $request, SeoEngineMockIngestor $ingestor): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json([
                'stats' => $this->emptyStats(),
                'sites' => [],
                'recommendations' => [],
                'reports' => [],
                'changes' => [],
            ]);
        }

        $tenant = PortalTenant::forUser($user);
        if (! $tenant) {
            return response()->json([
                'stats' => $this->emptyStats(),
                'sites' => [],
                'recommendations' => [],
                'reports' => [],
                'changes' => [],
            ]);
        }

        if (config('seo_engine.mock.enabled', false) && config('seo_engine.mock.auto_ingest', true) && ! app()->environment('testing')) {
            $ingestor->ingestForTenant($tenant, $user);
        }

        $sites = SeoSite::query()
            ->where('tenant_id', $tenant->id)
            ->orderByDesc('created_at')
            ->get([
                'id',
                'name',
                'url',
                'status',
                'tracking_id',
                'pixel_install_method',
                'pixel_install_status',
                'pixel_last_seen_at',
                'last_audit_at',
                'created_at',
            ]);

        $siteIds = $sites->pluck('id')->all();

        $recommendations = SeoRecommendation::query()
            ->with('site:id,name')
            ->whereIn('seo_site_id', $siteIds)
            ->orderByRaw(
                "CASE status
                    WHEN 'pending' THEN 1
                    WHEN 'approved' THEN 2
                    WHEN 'rejected' THEN 3
                    WHEN 'applied' THEN 4
                    WHEN 'failed' THEN 5
                    ELSE 6
                END"
            )
            ->orderByDesc('impact_score')
            ->limit(10)
            ->get([
                'id',
                'seo_site_id',
                'type',
                'title',
                'impact_score',
                'effort',
                'status',
                'created_at',
                'approved_at',
                'applied_at',
            ]);

        $reports = SeoReport::query()
            ->with('site:id,name')
            ->whereIn('seo_site_id', $siteIds)
            ->orderByDesc('period_end')
            ->limit(5)
            ->get([
                'id',
                'seo_site_id',
                'period_start',
                'period_end',
                'status',
                'highlights',
                'metrics',
                'created_at',
            ]);

        $changes = SeoChange::query()
            ->with('site:id,name')
            ->whereIn('seo_site_id', $siteIds)
            ->orderByDesc('created_at')
            ->limit(5)
            ->get([
                'id',
                'seo_site_id',
                'status',
                'summary',
                'applied_at',
                'created_at',
            ]);

        $stats = [
            'siteCount' => $sites->count(),
            'pendingRecommendations' => SeoRecommendation::query()
                ->whereIn('seo_site_id', $siteIds)
                ->where('status', 'pending')
                ->count(),
            'approvedRecommendations' => SeoRecommendation::query()
                ->whereIn('seo_site_id', $siteIds)
                ->where('status', 'approved')
                ->count(),
            'changesApplied' => SeoChange::query()
                ->whereIn('seo_site_id', $siteIds)
                ->where('status', 'applied')
                ->count(),
            'reportsReady' => SeoReport::query()
                ->whereIn('seo_site_id', $siteIds)
                ->where('status', 'ready')
                ->count(),
        ];

        return response()->json([
            'stats' => $stats,
            'sites' => $sites,
            'recommendations' => $recommendations,
            'reports' => $reports,
            'changes' => $changes,
        ]);
    }

    public function storeSite(StoreSeoSiteRequest $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $tenant = PortalTenant::forUser($user);
        if (! $tenant) {
            return response()->json(['message' => 'Tenant not found'], 404);
        }

        $data = $request->validated();

        $site = SeoSite::query()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'tracking_id' => (string) Str::uuid(),
            'name' => $data['name'],
            'url' => $data['url'],
            'status' => 'active',
            'settings' => [],
            'last_audit_at' => null,
            'pixel_install_method' => null,
            'pixel_install_status' => 'not_installed',
            'pixel_last_seen_at' => null,
        ]);

        return response()->json([
            'site' => $site,
        ], 201);
    }

    public function decideRecommendation(DecideSeoRecommendationRequest $request, SeoRecommendation $recommendation): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $tenant = PortalTenant::forUser($user);
        if (! $tenant) {
            return response()->json(['message' => 'Tenant not found'], 404);
        }

        if (! $this->recommendationBelongsToTenant($recommendation, $tenant->id)) {
            return response()->json(['message' => 'Recommendation not found'], 404);
        }

        if ($recommendation->status !== 'pending') {
            return response()->json(['message' => 'Only pending recommendations can be reviewed.'], 422);
        }

        $data = $request->validated();

        DB::transaction(function () use ($recommendation, $data, $user): void {
            SeoRecommendationApproval::query()->create([
                'seo_recommendation_id' => $recommendation->id,
                'user_id' => $user->id,
                'decision' => $data['decision'],
                'notes' => $data['notes'] ?? null,
                'decided_at' => now(),
            ]);

            $recommendation->update([
                'status' => $data['decision'],
                'approved_at' => $data['decision'] === 'approved' ? now() : null,
            ]);
        });

        return response()->json([
            'recommendation' => $recommendation->fresh(),
        ]);
    }

    public function generateReport(GenerateSeoReportRequest $request, SeoReportGenerator $generator): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $tenant = PortalTenant::forUser($user);
        if (! $tenant) {
            return response()->json(['message' => 'Tenant not found'], 404);
        }

        $data = $request->validated();

        $site = SeoSite::query()
            ->where('tenant_id', $tenant->id)
            ->findOrFail($data['seo_site_id']);

        $report = $generator->generateForSite($site, $data['period_start'], $data['period_end']);

        return response()->json([
            'report' => $report,
        ], 201);
    }

    public function updatePixelInstall(UpdateSeoPixelInstallRequest $request, SeoSite $site): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $tenant = PortalTenant::forUser($user);
        if (! $tenant || ! $this->siteBelongsToTenant($site, $tenant->id)) {
            return response()->json(['message' => 'Site not found'], 404);
        }

        $data = $request->validated();

        $method = $data['method'] ?? null;
        $status = $data['status'] ?? ($method && $method !== 'manual' ? 'pending' : 'pending');

        if ($method === 'manual' && $status === 'installed' && ! $site->pixel_last_seen_at) {
            $site->pixel_last_seen_at = now();
        }

        $site->update([
            'pixel_install_method' => $method,
            'pixel_install_status' => $status,
        ]);

        return response()->json([
            'site' => $site->fresh(),
        ]);
    }

    public function downloadReport(Request $request, SeoReport $report): Response
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $tenant = PortalTenant::forUser($user);
        if (! $tenant || ! $this->reportBelongsToTenant($report, $tenant->id)) {
            return response()->json(['message' => 'Report not found'], 404);
        }

        $report->loadMissing('site:id,name,url');
        $payload = $this->buildReportPayload($report);
        $fileName = sprintf(
            'seo-report-%s-%s.json',
            Str::slug((string) ($report->site?->name ?? 'site')),
            $report->period_end?->format('Y-m-d') ?? now()->format('Y-m-d'),
        );

        return response()->streamDownload(
            static function () use ($payload): void {
                echo json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
            },
            $fileName,
            ['Content-Type' => 'application/json']
        );
    }

    /**
     * @return array<string, int>
     */
    private function emptyStats(): array
    {
        return [
            'siteCount' => 0,
            'pendingRecommendations' => 0,
            'approvedRecommendations' => 0,
            'changesApplied' => 0,
            'reportsReady' => 0,
        ];
    }

    private function recommendationBelongsToTenant(SeoRecommendation $recommendation, string $tenantId): bool
    {
        return SeoSite::query()
            ->where('tenant_id', $tenantId)
            ->where('id', $recommendation->seo_site_id)
            ->exists();
    }

    private function reportBelongsToTenant(SeoReport $report, string $tenantId): bool
    {
        return SeoSite::query()
            ->where('tenant_id', $tenantId)
            ->where('id', $report->seo_site_id)
            ->exists();
    }

    private function siteBelongsToTenant(SeoSite $site, string $tenantId): bool
    {
        return $site->tenant_id === $tenantId;
    }

    /**
     * @return array<string, mixed>
     */
    private function buildReportPayload(SeoReport $report): array
    {
        return [
            'id' => $report->id,
            'site' => $report->site ? [
                'id' => $report->site->id,
                'name' => $report->site->name,
                'url' => $report->site->url,
            ] : null,
            'period_start' => $report->period_start?->toDateString(),
            'period_end' => $report->period_end?->toDateString(),
            'status' => $report->status,
            'highlights' => $report->highlights ?? [],
            'metrics' => $report->metrics ?? [],
            'created_at' => $report->created_at?->toIso8601String(),
        ];
    }
}
