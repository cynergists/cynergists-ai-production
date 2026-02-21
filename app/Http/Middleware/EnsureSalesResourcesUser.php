<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSalesResourcesUser
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user instanceof User) {
            if ($request->expectsJson() || $request->is('api/*')) {
                abort(401);
            }

            return redirect()->to('/signin?redirect='.urlencode($request->getRequestUri()));
        }

        $hasAccess = $user->userRoles()
            ->whereIn('role', ['sales_rep', 'admin'])
            ->exists();

        if (! $hasAccess) {
            if ($request->expectsJson() || $request->is('api/*')) {
                abort(403);
            }

            return redirect()->to('/portal');
        }

        return $next($request);
    }
}
