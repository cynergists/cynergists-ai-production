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
            'password' => ['required', 'string', 'min:6'],
        ]);

        $user = $request->user();

        if (! $user || ! Hash::check($data['current_password'], $user->password)) {
            return response()->json(['message' => 'Current password is incorrect.'], 422);
        }

        $user->update([
            'password' => Hash::make($data['password']),
            'password_change_required' => false,
        ]);

        return response()->json(['success' => true]);
    }
}
