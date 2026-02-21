<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Admin\ImpersonationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ImpersonationController extends Controller
{
    public function __construct(
        private ImpersonationService $impersonationService
    ) {}

    /**
     * Search for users to impersonate.
     */
    public function search(Request $request): JsonResponse
    {
        $admin = $request->user();

        if (! $admin || ! $admin->hasRole('admin')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $query = $request->input('query', '');

        $users = User::query()
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('email', 'like', "%{$query}%");
            })
            ->whereDoesntHave('roles', function ($q) {
                $q->where('name', 'admin');
            })
            ->limit(20)
            ->get(['id', 'name', 'email', 'created_at']);

        return response()->json([
            'users' => $users->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'created_at' => $user->created_at->format('Y-m-d'),
                ];
            }),
        ]);
    }

    /**
     * Start impersonating a user.
     */
    public function start(Request $request): JsonResponse
    {
        $admin = $request->user();

        if (! $admin || ! $admin->hasRole('admin')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'reason' => 'nullable|string|max:500',
        ]);

        $targetUser = User::find($validated['user_id']);

        if (! $targetUser) {
            return response()->json(['error' => 'User not found'], 404);
        }

        try {
            $log = $this->impersonationService->start(
                $admin,
                $targetUser,
                $validated['reason'] ?? null
            );

            return response()->json([
                'success' => true,
                'message' => "Now impersonating {$targetUser->name}",
                'impersonated_user' => [
                    'id' => $targetUser->id,
                    'name' => $targetUser->name,
                    'email' => $targetUser->email,
                ],
                'log_id' => $log->id,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * End impersonation.
     */
    public function end(Request $request): JsonResponse
    {
        $admin = $request->user();

        if (! $admin) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        if (! $this->impersonationService->isImpersonating()) {
            return response()->json(['error' => 'Not currently impersonating'], 400);
        }

        $this->impersonationService->end($admin, 'manual');

        return response()->json([
            'success' => true,
            'message' => 'Impersonation ended',
        ]);
    }

    /**
     * Get current impersonation status.
     */
    public function status(Request $request): JsonResponse
    {
        if (! $this->impersonationService->isImpersonating()) {
            return response()->json([
                'impersonating' => false,
            ]);
        }

        $impersonatedUser = $this->impersonationService->getImpersonatedUser();
        $admin = $this->impersonationService->getActualAdmin();
        $log = $this->impersonationService->getCurrentLog();

        return response()->json([
            'impersonating' => true,
            'admin' => [
                'id' => $admin->id,
                'name' => $admin->name,
                'email' => $admin->email,
            ],
            'impersonated_user' => [
                'id' => $impersonatedUser->id,
                'name' => $impersonatedUser->name,
                'email' => $impersonatedUser->email,
            ],
            'started_at' => $log->started_at->toIso8601String(),
            'reason' => $log->reason,
        ]);
    }

    /**
     * Get impersonation logs (admin only).
     */
    public function logs(Request $request): JsonResponse
    {
        $admin = $request->user();

        if (! $admin || ! $admin->hasRole('admin')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $logs = $this->impersonationService->getAdminLogs($admin);

        return response()->json([
            'logs' => $logs->map(function ($log) {
                return [
                    'id' => $log->id,
                    'impersonated_user_name' => $log->impersonated_user_name,
                    'impersonated_user_email' => $log->impersonated_user_email,
                    'started_at' => $log->started_at->toIso8601String(),
                    'ended_at' => $log->ended_at?->toIso8601String(),
                    'end_reason' => $log->end_reason,
                    'reason' => $log->reason,
                    'duration_minutes' => $log->ended_at
                        ? $log->started_at->diffInMinutes($log->ended_at)
                        : null,
                ];
            }),
        ]);
    }
}
