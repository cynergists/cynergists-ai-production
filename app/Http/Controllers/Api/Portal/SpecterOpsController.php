<?php

namespace App\Http\Controllers\Api\Portal;

use App\Http\Controllers\Controller;
use App\Http\Requests\Portal\SpecterManualActionRequest;
use App\Http\Requests\Portal\UpsertSpecterScoringRulesRequest;
use App\Models\PortalTenant;
use App\Models\SpecterScoringRule;
use App\Models\SpecterSession;
use App\Services\Specter\SpecterEscalationService;
use App\Services\Specter\SpecterGhlSyncService;
use App\Services\Specter\SpecterIdentityResolutionService;
use App\Services\Specter\SpecterIntentScoringService;
use App\Services\Specter\SpecterWorkflowTriggerService;
use Illuminate\Http\JsonResponse;

class SpecterOpsController extends Controller
{
    public function __construct(
        private SpecterIntentScoringService $scoringService,
        private SpecterIdentityResolutionService $identityResolutionService,
        private SpecterGhlSyncService $ghlSyncService,
        private SpecterEscalationService $escalationService,
        private SpecterWorkflowTriggerService $workflowTriggerService
    ) {}

    public function score(SpecterManualActionRequest $request): JsonResponse
    {
        [$tenant, $session] = $this->resolveTenantAndSession($request->validated('session_id'));
        if (! $tenant || ! $session) {
            return response()->json(['success' => false], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $this->scoringService->scoreSession($session, $tenant),
        ]);
    }

    public function resolveIdentity(SpecterManualActionRequest $request): JsonResponse
    {
        [$tenant, $session] = $this->resolveTenantAndSession($request->validated('session_id'));
        if (! $tenant || ! $session) {
            return response()->json(['success' => false], 404);
        }

        $data = $this->identityResolutionService->resolve(
            session: $session,
            tenant: $tenant,
            sensitiveSignals: (array) $request->validated('identity', []),
            request: $request
        );

        return response()->json(['success' => true, 'data' => $data]);
    }

    public function sync(SpecterManualActionRequest $request): JsonResponse
    {
        [$tenant, $session] = $this->resolveTenantAndSession($request->validated('session_id'));
        if (! $tenant || ! $session) {
            return response()->json(['success' => false], 404);
        }

        $result = $this->ghlSyncService->syncSession($tenant, $session, [
            'resolved' => in_array($session->resolution_status, ['resolved', 'partial'], true),
            'contact' => (array) $request->validated('identity', []),
            'company' => array_filter([
                'company_name' => $session->company_name,
                'company_domain' => $session->company_domain,
            ]),
        ]);

        return response()->json(['success' => true, 'data' => $result]);
    }

    public function escalate(SpecterManualActionRequest $request): JsonResponse
    {
        [$tenant, $session] = $this->resolveTenantAndSession($request->validated('session_id'));
        if (! $tenant || ! $session) {
            return response()->json(['success' => false], 404);
        }

        $log = $this->escalationService->escalate(
            tenant: $tenant,
            session: $session,
            reasonCode: (string) ($request->validated('reason_code') ?? SpecterEscalationService::REASON_PROVIDER_FAILURE),
            reason: (string) ($request->validated('reason') ?? 'Manual Specter escalation'),
            details: (array) $request->validated('details', []),
            integration: 'haven'
        );

        return response()->json(['success' => true, 'data' => $log]);
    }

    public function trigger(SpecterManualActionRequest $request): JsonResponse
    {
        [$tenant, $session] = $this->resolveTenantAndSession($request->validated('session_id'));
        if (! $tenant || ! $session) {
            return response()->json(['success' => false], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $this->workflowTriggerService->triggerHighIntentWorkflow($tenant, $session),
        ]);
    }

    public function rules(): JsonResponse
    {
        $tenant = $this->resolveTenant();
        if (! $tenant) {
            return response()->json(['rules' => []], 404);
        }

        return response()->json([
            'rules' => SpecterScoringRule::query()
                ->where('tenant_id', $tenant->id)
                ->orderBy('sort_order')
                ->get(),
        ]);
    }

    public function upsertRules(UpsertSpecterScoringRulesRequest $request): JsonResponse
    {
        $tenant = $this->resolveTenant();
        if (! $tenant) {
            return response()->json(['success' => false], 404);
        }

        SpecterScoringRule::query()->where('tenant_id', $tenant->id)->delete();

        foreach ($request->validated('rules') as $rule) {
            SpecterScoringRule::query()->create([
                'tenant_id' => $tenant->id,
                'signal_key' => $rule['signal_key'],
                'weight' => (float) $rule['weight'],
                'config' => $rule['config'] ?? [],
                'is_active' => (bool) ($rule['is_active'] ?? true),
                'sort_order' => (int) ($rule['sort_order'] ?? 0),
            ]);
        }

        return response()->json(['success' => true]);
    }

    private function resolveTenant(): ?PortalTenant
    {
        $user = request()->user();
        if (! $user) {
            return null;
        }

        return PortalTenant::forUser($user);
    }

    /**
     * @return array{0:PortalTenant|null,1:SpecterSession|null}
     */
    private function resolveTenantAndSession(string $sessionId): array
    {
        $tenant = $this->resolveTenant();
        if (! $tenant) {
            return [null, null];
        }

        $session = SpecterSession::query()
            ->with('visitor', 'events')
            ->where('tenant_id', $tenant->id)
            ->where('session_id', $sessionId)
            ->first();

        return [$tenant, $session];
    }
}
