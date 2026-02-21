<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\AgentAccess;
use App\Models\PortalTenant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use App\Services\Admin\ImpersonationService;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class SessionController extends Controller
{
    public function store(LoginRequest $request): Response
    {
        $credentials = $request->only(['email', 'password']);
        $remember = $request->boolean('remember');

        // Check if user exists and is inactive
        $user = \App\Models\User::where('email', $credentials['email'])->first();

        if ($user && ! $user->is_active) {
            throw ValidationException::withMessages([
                'email' => 'Your account has been deactivated. Please contact support for assistance.',
            ]);
        }

        if (! Auth::attempt($credentials, $remember)) {
            throw ValidationException::withMessages([
                'email' => 'The email or password you entered is incorrect. Please check your credentials and try again, or use the "Forgot password?" link to reset your password.',
            ]);
        }

        $request->session()->regenerate();

        $user = $request->user();
        if ($user) {
            $user->profile()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'email' => $user->email,
                    'status' => 'active',
                    'last_login' => now(),
                ],
            );
        }

        $redirect = $request->input('redirect');
        if (is_string($redirect) && $this->isSafeRedirect($redirect)) {
            // Use full page redirect for Filament routes
            if (Str::startsWith($redirect, '/filament') || Str::startsWith($redirect, '/admin')) {
                return Inertia::location($redirect);
            }

            return redirect()->to($redirect);
        }

        $tenant = PortalTenant::forUser($user);
        if ($tenant) {
            $cynessa = AgentAccess::firstOrCreate(
                ['tenant_id' => $tenant->id, 'agent_name' => 'Cynessa'],
                [
                    'id' => (string) Str::uuid(),
                    'agent_type' => 'assistant',
                    'is_active' => true,
                    'usage_count' => 0,
                    'customer_id' => $tenant->square_customer_id,
                ],
            );

            return redirect()->to("/portal/agents/{$cynessa->id}/chat");
        }

        return redirect()->to('/portal');
    }

    public function destroy(Request $request): RedirectResponse
    {
        // End impersonation if active
        $impersonationService = app(ImpersonationService::class);
        if ($impersonationService->isImpersonating()) {
            $admin = $impersonationService->getActualAdmin();
            if ($admin) {
                $impersonationService->end($admin, 'logout');
            }
        }

        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->to('/');
    }

    private function isSafeRedirect(string $redirect): bool
    {
        return Str::startsWith($redirect, '/') && ! Str::startsWith($redirect, '//');
    }
}
