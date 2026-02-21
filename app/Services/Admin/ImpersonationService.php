<?php

namespace App\Services\Admin;

use App\Models\ImpersonationLog;
use App\Models\User;
use Illuminate\Support\Facades\Session;

/**
 * Admin User Impersonation System
 *
 * Per Google Doc Spec: Enable Admin users to impersonate any non-admin user
 * to view, validate, debug, and support the user's full AI Agent portal experience.
 */
class ImpersonationService
{
    private const SESSION_KEY = 'impersonating_user_id';

    private const LOG_ID_KEY = 'impersonation_log_id';

    /**
     * Start impersonating a user.
     *
     * @throws \Exception
     */
    public function start(User $admin, User $targetUser, ?string $reason = null): ImpersonationLog
    {
        // Security checks
        if (! $admin->hasRole('admin')) {
            throw new \Exception('Only admins can impersonate users.');
        }

        if ($targetUser->hasRole('admin')) {
            throw new \Exception('Cannot impersonate admin users.');
        }

        if (! $targetUser->is_active ?? true) {
            throw new \Exception('Cannot impersonate disabled accounts.');
        }

        // End any existing impersonation for this admin
        $this->endCurrent($admin, 'switched');

        // Create impersonation log
        $log = ImpersonationLog::create([
            'admin_id' => (string) $admin->id,
            'impersonated_user_id' => (string) $targetUser->id,
            'impersonated_user_email' => $targetUser->email,
            'impersonated_user_name' => $targetUser->name,
            'started_at' => now(),
            'reason' => $reason,
        ]);

        // Store in session
        Session::put(self::SESSION_KEY, $targetUser->id);
        Session::put(self::LOG_ID_KEY, $log->id);
        Session::save();

        return $log;
    }

    /**
     * End current impersonation.
     */
    public function end(User $admin, string $reason = 'manual'): void
    {
        $logId = Session::get(self::LOG_ID_KEY);

        if ($logId) {
            $log = ImpersonationLog::find($logId);
            if ($log && $log->isActive()) {
                $log->end($reason);
            }
        }

        Session::forget(self::SESSION_KEY);
        Session::forget(self::LOG_ID_KEY);
        Session::save();
    }

    /**
     * End current impersonation by searching for active log.
     */
    public function endCurrent(User $admin, string $reason = 'manual'): void
    {
        // End session-based impersonation
        $logId = Session::get(self::LOG_ID_KEY);
        if ($logId) {
            $log = ImpersonationLog::find($logId);
            if ($log && $log->isActive()) {
                $log->end($reason);
            }
        }

        // Also end any other active impersonations for this admin
        ImpersonationLog::where('admin_id', $admin->id)
            ->whereNull('ended_at')
            ->update([
                'ended_at' => now(),
                'end_reason' => $reason,
            ]);

        Session::forget(self::SESSION_KEY);
        Session::forget(self::LOG_ID_KEY);
        Session::save();
    }

    /**
     * Check if currently impersonating.
     */
    public function isImpersonating(): bool
    {
        return Session::has(self::SESSION_KEY);
    }

    /**
     * Get the ID of the user being impersonated.
     */
    public function getImpersonatedUserId(): ?string
    {
        return Session::get(self::SESSION_KEY);
    }

    /**
     * Get the user being impersonated.
     */
    public function getImpersonatedUser(): ?User
    {
        $userId = $this->getImpersonatedUserId();

        return $userId ? User::find($userId) : null;
    }

    /**
     * Get the current impersonation log.
     */
    public function getCurrentLog(): ?ImpersonationLog
    {
        $logId = Session::get(self::LOG_ID_KEY);

        return $logId ? ImpersonationLog::find($logId) : null;
    }

    /**
     * Get the actual admin user (not impersonated).
     */
    public function getActualAdmin(): ?User
    {
        if (! $this->isImpersonating()) {
            return null;
        }

        $log = $this->getCurrentLog();

        return $log ? User::find($log->admin_id) : null;
    }

    /**
     * Log an action taken during impersonation.
     */
    public function logAction(string $action, array $metadata = []): void
    {
        $log = $this->getCurrentLog();

        if (! $log) {
            return;
        }

        $actions = $log->actions_taken ?? [];
        $actions[] = [
            'action' => $action,
            'metadata' => $metadata,
            'timestamp' => now()->toDateTimeString(),
        ];

        $log->update(['actions_taken' => $actions]);
    }

    /**
     * Get all impersonation logs for an admin.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getAdminLogs(User $admin)
    {
        return ImpersonationLog::where('admin_id', $admin->id)
            ->orderBy('started_at', 'desc')
            ->get();
    }

    /**
     * Get all impersonation logs for a user (when they were impersonated).
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getUserLogs(User $user)
    {
        return ImpersonationLog::where('impersonated_user_id', $user->id)
            ->orderBy('started_at', 'desc')
            ->get();
    }
}
