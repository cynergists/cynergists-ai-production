<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Specter\IngestSpecterEventsRequest;
use App\Jobs\Specter\ProcessSpecterIngestJob;
use App\Models\PortalTenant;
use App\Services\Specter\SpecterIngestService;
use Illuminate\Http\JsonResponse;

class SpecterController extends Controller
{
    public function __construct(
        private SpecterIngestService $specterIngestService
    ) {}

    public function ingest(IngestSpecterEventsRequest $request): JsonResponse
    {
        $tenant = PortalTenant::query()->find($request->validated('tenant_id'));
        if (! $tenant) {
            return response()->json(['error' => 'Tenant not found'], 404);
        }

        $expectedSiteKey = (string) (($tenant->settings['specter_data']['site_key'] ?? $tenant->settings['specter_site_key'] ?? '') ?: '');
        if ($expectedSiteKey === '' || ! hash_equals($expectedSiteKey, (string) $request->validated('site_key'))) {
            return response()->json(['error' => 'Invalid site key'], 403);
        }

        if (! $request->boolean('process_immediately', true)) {
            ProcessSpecterIngestJob::dispatch($tenant->id, $request->validated());

            return response()->json([
                'success' => true,
                'queued' => true,
                'session_id' => $request->validated('session_id'),
                'visitor_id' => $request->validated('visitor_id'),
            ], 202);
        }

        $result = $this->specterIngestService->ingest($tenant, $request->validated(), $request);

        return response()->json([
            'success' => true,
            'data' => $result,
        ], 202);
    }
}
