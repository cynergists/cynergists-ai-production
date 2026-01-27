<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class SessionController extends Controller
{
    public function store(LoginRequest $request): RedirectResponse
    {
        $credentials = $request->only(['email', 'password']);
        $remember = $request->boolean('remember');

        if (! Auth::attempt($credentials, $remember)) {
            throw ValidationException::withMessages([
                'email' => 'These credentials do not match our records.',
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
            return redirect()->to($redirect);
        }

        if ($user) {
            return redirect()->to($this->resolveRedirectForUser($user->roleNames()));
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
            return '/admin/dashboard';
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
