<?php

namespace App\Http\Controllers\Api\Portal;

use App\Http\Controllers\Controller;
use App\Http\Requests\Portal\UpdatePortalProfileRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PortalProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['profile' => null], 401);
        }

        return response()->json([
            'profile' => $user->profile,
        ]);
    }

    public function update(UpdatePortalProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['success' => false], 401);
        }

        $data = $request->validated();
        $profileData = [
            'email' => $user->email,
        ];

        foreach (['first_name', 'last_name', 'company_name'] as $field) {
            if (array_key_exists($field, $data)) {
                $profileData[$field] = $data[$field];
            }
        }

        $profile = $user->profile()->updateOrCreate(
            ['user_id' => $user->id],
            $profileData
        );

        return response()->json([
            'success' => true,
            'profile' => $profile,
        ]);
    }
}
