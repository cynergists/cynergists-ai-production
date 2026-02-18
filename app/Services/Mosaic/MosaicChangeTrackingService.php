<?php

namespace App\Services\Mosaic;

use App\Models\MosaicChangeLog;
use App\Models\PortalTenant;
use App\Models\User;
use Carbon\Carbon;

class MosaicChangeTrackingService
{
    public function logChange(PortalTenant $tenant, User $user, string $changeType, string $description): MosaicChangeLog
    {
        return MosaicChangeLog::create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'change_type' => $changeType,
            'description' => $description,
            'requested_at' => now(),
            'applied_at' => now(),
        ]);
    }

    public function getMonthlyUsage(PortalTenant $tenant): int
    {
        $startOfMonth = Carbon::now()->startOfMonth();

        return MosaicChangeLog::where('tenant_id', $tenant->id)
            ->where('requested_at', '>=', $startOfMonth)
            ->count();
    }

    public function hasExceededLimit(PortalTenant $tenant): bool
    {
        $usage = $this->getMonthlyUsage($tenant);
        $limit = $this->getLimit($tenant);

        if ($limit === null) {
            return false;
        }

        return $usage >= $limit;
    }

    public function getLimit(PortalTenant $tenant): ?int
    {
        $subscription = $tenant->subscriptions()->where('status', 'active')->first();

        if (! $subscription) {
            return 10;
        }

        $plan = $subscription->plan ?? [];

        return $plan['mosaic_change_limit'] ?? 10;
    }

    public function warnApproachingLimit(PortalTenant $tenant): ?string
    {
        $usage = $this->getMonthlyUsage($tenant);
        $limit = $this->getLimit($tenant);

        if ($limit === null) {
            return null;
        }

        $threshold = (int) ($limit * 0.8);

        if ($usage >= $threshold && $usage < $limit) {
            return "You have used {$usage} of {$limit} monthly changes. You are approaching your limit.";
        }

        if ($usage >= $limit) {
            return "You have reached your monthly change limit ({$limit}). Additional changes require an upgrade.";
        }

        return null;
    }
}
