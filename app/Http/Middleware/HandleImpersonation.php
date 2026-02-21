<?php

namespace App\Http\Middleware;

use App\Services\Admin\ImpersonationService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Handle Impersonation Middleware
 *
 * Per Google Doc Spec: When impersonating, the admin inherits ONLY the
 * impersonated user's permissions. Admin privileges must not carry over.
 */
class HandleImpersonation
{
    public function __construct(
        private ImpersonationService $impersonationService
    ) {}

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // If impersonating, swap the authenticated user
        if ($this->impersonationService->isImpersonating()) {
            $impersonatedUser = $this->impersonationService->getImpersonatedUser();

            if ($impersonatedUser) {
                // Replace the authenticated user with the impersonated user
                // This ensures all role checks, permissions, etc. apply to the impersonated user
                Auth::setUser($impersonatedUser);
                $request->setUserResolver(fn () => $impersonatedUser);

                // Store admin ID for audit purposes
                $admin = $this->impersonationService->getActualAdmin();
                $request->attributes->set('impersonating_admin_id', $admin?->id);
                $request->attributes->set('is_impersonating', true);
            }
        }

        return $next($request);
    }
}
