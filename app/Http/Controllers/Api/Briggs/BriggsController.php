<?php

namespace App\Http\Controllers\Api\Briggs;

use App\Http\Controllers\Controller;
use App\Models\BriggsTrainingScenario;
use App\Models\BriggsTrainingSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BriggsController extends Controller
{
    /**
     * List all active training scenarios.
     */
    public function scenarios(Request $request): JsonResponse
    {
        $query = BriggsTrainingScenario::query()
            ->where('is_active', true)
            ->orderBy('sort_order');

        if ($request->has('category')) {
            $query->where('category', $request->input('category'));
        }

        if ($request->has('difficulty')) {
            $query->where('difficulty', $request->input('difficulty'));
        }

        return response()->json([
            'scenarios' => $query->get(),
        ]);
    }

    /**
     * List the user's training sessions.
     */
    public function sessions(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['sessions' => []], 401);
        }

        $sessions = BriggsTrainingSession::query()
            ->where('user_id', $user->id)
            ->with('scenario:id,title,category,difficulty')
            ->orderByDesc('created_at')
            ->limit(25)
            ->get();

        return response()->json([
            'sessions' => $sessions,
        ]);
    }

    /**
     * Get a specific session detail.
     */
    public function sessionDetail(Request $request, string $session): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['session' => null], 401);
        }

        $sessionRecord = BriggsTrainingSession::query()
            ->where('id', $session)
            ->where('user_id', $user->id)
            ->with('scenario')
            ->first();

        if (! $sessionRecord) {
            return response()->json(['session' => null], 404);
        }

        return response()->json([
            'session' => $sessionRecord,
        ]);
    }
}
