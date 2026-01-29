<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
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

        if ($user) {
            $targetUrl = $this->resolveRedirectForUser($user->roleNames());

            // Admins go to Filament which requires a full page refresh
            if (in_array('admin', $user->roleNames(), true)) {
                return Inertia::location($targetUrl);
            }

            return redirect()->to($targetUrl);
        }

        return redirect()->intended('/');
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->to('/');
    }

    /**
     * @param  list<string>  $roles
     */
    private function resolveRedirectForUser(array $roles): string
    {
        if (in_array('admin', $roles, true)) {
            return '/filament';
        }

        if (in_array('sales_rep', $roles, true)) {
            return '/sales-rep';
        }

        if (in_array('employee', $roles, true)) {
            return '/employee';
        }

        if (in_array('client', $roles, true)) {
            return '/portal';
        }

        if (in_array('partner', $roles, true) && ! in_array('client', $roles, true)) {
            return '/partner';
        }

        return '/';
    }

    private function isSafeRedirect(string $redirect): bool
    {
        return Str::startsWith($redirect, '/') && ! Str::startsWith($redirect, '//');
    }
}
