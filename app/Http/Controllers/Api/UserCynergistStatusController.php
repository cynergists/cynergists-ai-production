<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UserCynergistStatusRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class UserCynergistStatusController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(UserCynergistStatusRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $user = User::query()
            ->where('email', $validated['email'])
            ->where('is_active', true)
            ->first();

        return response()->json([
            'active_account' => (bool) $user,
            'cynergist_attached' => $user?->cynergists()
                ->where('name', $validated['cynergist'])
                ->exists() ?? false,
        ]);
    }
}
