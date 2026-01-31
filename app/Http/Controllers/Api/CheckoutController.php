<?php

namespace App\Http\Controllers\Api;

use App\Concerns\PasswordValidationRules;
use App\Http\Controllers\Controller;
use App\Models\PortalTenant;
use App\Models\Profile;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CheckoutController extends Controller
{
    use PasswordValidationRules;

    /**
     * Check if an email exists in the users table.
     */
    public function checkEmail(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'string', 'email', 'max:255'],
        ]);

        $exists = User::where('email', $request->email)->exists();

        return response()->json([
            'exists' => $exists,
        ]);
    }

    /**
     * Register a new user during checkout.
     */
    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'first_name' => ['required', 'string', 'max:50'],
            'last_name' => ['required', 'string', 'max:50'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique(User::class)],
            'password' => $this->passwordRules(),
        ]);

        $user = DB::transaction(function () use ($request): User {
            $user = User::create([
                'name' => trim($request->first_name.' '.$request->last_name),
                'email' => $request->email,
                'password' => $request->password,
                'is_active' => true,
            ]);

            Profile::create([
                'user_id' => $user->id,
                'email' => $request->email,
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'status' => 'active',
            ]);

            UserRole::create([
                'user_id' => $user->id,
                'role' => 'client',
            ]);

            // Create a portal tenant for the new client
            PortalTenant::create([
                'id' => (string) Str::uuid(),
                'user_id' => $user->id,
                'company_name' => trim($request->first_name.' '.$request->last_name),
                'subdomain' => $this->generateTempSubdomain(),
                'is_temp_subdomain' => true,
                'status' => 'active',
            ]);

            return $user;
        });

        // Log the user in
        Auth::login($user);

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
        ], 201);
    }

    private function generateTempSubdomain(): string
    {
        do {
            $subdomain = 'tmp-'.Str::lower(Str::random(8));
        } while (PortalTenant::where('subdomain', $subdomain)->exists());

        return $subdomain;
    }
}
