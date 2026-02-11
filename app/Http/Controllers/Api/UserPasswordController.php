<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserPasswordController extends Controller
{
    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'User not authenticated.'], 401);
        }

        if (! Hash::check($data['current_password'], $user->password)) {
            return response()->json(['message' => 'Current password is incorrect.'], 422);
        }

        // Update password (will be automatically hashed by the 'hashed' cast)
        $user->update([
            'password' => $data['password'],
            'password_change_required' => false,
        ]);

        return response()->json(['success' => true]);
    }
}
