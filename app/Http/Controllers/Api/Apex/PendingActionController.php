<?php

namespace App\Http\Controllers\Api\Apex;

use App\Http\Controllers\Controller;
use App\Models\ApexPendingAction;
use App\Models\PortalAvailableAgent;
use App\Services\Apex\PendingActionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PendingActionController extends Controller
{
    public function __construct(
        private PendingActionService $pendingActionService
    ) {}

    /**
     * List pending actions for the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $actions = $this->pendingActionService->getPendingActions(
            $request->user(),
            $request->get('limit', 50)
        );

        return response()->json([
            'actions' => $actions,
            'total' => $actions->count(),
        ]);
    }

    /**
     * Get a single pending action.
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $action = ApexPendingAction::query()
            ->where('user_id', $request->user()->id)
            ->where('id', $id)
            ->with(['campaign', 'prospect'])
            ->firstOrFail();

        return response()->json(['action' => $action]);
    }

    /**
     * Approve a single pending action.
     */
    public function approve(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'agent_id' => ['required', 'string', 'exists:portal_available_agents,id'],
        ]);

        $action = ApexPendingAction::query()
            ->where('user_id', $request->user()->id)
            ->where('id', $id)
            ->with(['campaign', 'prospect'])
            ->firstOrFail();

        if (! $action->isPending()) {
            return response()->json([
                'error' => 'Action is not pending.',
                'status' => $action->status,
            ], 422);
        }

        if ($action->isExpired()) {
            return response()->json([
                'error' => 'Action has expired.',
            ], 422);
        }

        $agent = PortalAvailableAgent::findOrFail($request->agent_id);
        $success = $this->pendingActionService->approve($action, $agent);

        if ($success) {
            return response()->json([
                'message' => 'Action approved and executed successfully.',
                'action' => $action->fresh(),
            ]);
        }

        return response()->json([
            'error' => 'Action was approved but execution failed. Please try again.',
            'action' => $action->fresh(),
        ], 500);
    }

    /**
     * Deny a single pending action.
     */
    public function deny(Request $request, string $id): JsonResponse
    {
        $action = ApexPendingAction::query()
            ->where('user_id', $request->user()->id)
            ->where('id', $id)
            ->firstOrFail();

        if (! $action->isPending()) {
            return response()->json([
                'error' => 'Action is not pending.',
                'status' => $action->status,
            ], 422);
        }

        $this->pendingActionService->deny($action);

        return response()->json([
            'message' => 'Action denied successfully.',
            'action' => $action->fresh(),
        ]);
    }

    /**
     * Approve multiple pending actions.
     */
    public function approveMultiple(Request $request): JsonResponse
    {
        $request->validate([
            'action_ids' => ['required', 'array', 'min:1'],
            'action_ids.*' => ['string', 'exists:apex_pending_actions,id'],
            'agent_id' => ['required', 'string', 'exists:portal_available_agents,id'],
        ]);

        $actions = ApexPendingAction::query()
            ->where('user_id', $request->user()->id)
            ->whereIn('id', $request->action_ids)
            ->pending()
            ->notExpired()
            ->with(['campaign', 'prospect'])
            ->get();

        if ($actions->isEmpty()) {
            return response()->json([
                'error' => 'No valid pending actions found.',
            ], 422);
        }

        $agent = PortalAvailableAgent::findOrFail($request->agent_id);
        $results = $this->pendingActionService->approveMultiple($actions, $agent);

        return response()->json([
            'message' => "Approved {$results['approved']} action(s), executed {$results['executed']}, failed {$results['failed']}.",
            'results' => $results,
        ]);
    }

    /**
     * Deny multiple pending actions.
     */
    public function denyMultiple(Request $request): JsonResponse
    {
        $request->validate([
            'action_ids' => ['required', 'array', 'min:1'],
            'action_ids.*' => ['string', 'exists:apex_pending_actions,id'],
        ]);

        $actions = ApexPendingAction::query()
            ->where('user_id', $request->user()->id)
            ->whereIn('id', $request->action_ids)
            ->pending()
            ->get();

        if ($actions->isEmpty()) {
            return response()->json([
                'error' => 'No valid pending actions found.',
            ], 422);
        }

        $denied = $this->pendingActionService->denyMultiple($actions);

        return response()->json([
            'message' => "Denied {$denied} action(s).",
            'denied' => $denied,
        ]);
    }

    /**
     * Approve all pending actions for the user.
     */
    public function approveAll(Request $request): JsonResponse
    {
        $request->validate([
            'agent_id' => ['required', 'string', 'exists:portal_available_agents,id'],
        ]);

        $actions = ApexPendingAction::query()
            ->where('user_id', $request->user()->id)
            ->pending()
            ->notExpired()
            ->with(['campaign', 'prospect'])
            ->get();

        if ($actions->isEmpty()) {
            return response()->json([
                'message' => 'No pending actions to approve.',
                'results' => ['approved' => 0, 'executed' => 0, 'failed' => 0],
            ]);
        }

        $agent = PortalAvailableAgent::findOrFail($request->agent_id);
        $results = $this->pendingActionService->approveMultiple($actions, $agent);

        return response()->json([
            'message' => "Approved {$results['approved']} action(s), executed {$results['executed']}, failed {$results['failed']}.",
            'results' => $results,
        ]);
    }

    /**
     * Deny all pending actions for the user.
     */
    public function denyAll(Request $request): JsonResponse
    {
        $actions = ApexPendingAction::query()
            ->where('user_id', $request->user()->id)
            ->pending()
            ->get();

        if ($actions->isEmpty()) {
            return response()->json([
                'message' => 'No pending actions to deny.',
                'denied' => 0,
            ]);
        }

        $denied = $this->pendingActionService->denyMultiple($actions);

        return response()->json([
            'message' => "Denied {$denied} action(s).",
            'denied' => $denied,
        ]);
    }
}
