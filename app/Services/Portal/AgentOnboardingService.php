<?php

namespace App\Services\Portal;

use App\Models\AgentOnboardingState;
use App\Models\OnboardingAuditLog;
use App\Models\PortalTenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class AgentOnboardingService
{
    /**
     * Get or create the onboarding state row for a tenant + agent.
     */
    public function getOrCreateState(PortalTenant $tenant, string $agentName): AgentOnboardingState
    {
        return AgentOnboardingState::firstOrCreate(
            ['tenant_id' => $tenant->id, 'agent_name' => $agentName],
            ['state' => 'not_started']
        );
    }

    /**
     * Check if a specific agent's onboarding is complete for a tenant.
     */
    public function isComplete(PortalTenant $tenant, string $agentName): bool
    {
        return AgentOnboardingState::where('tenant_id', $tenant->id)
            ->where('agent_name', $agentName)
            ->where('state', 'completed')
            ->exists();
    }

    /**
     * Check if Iris onboarding is complete.
     *
     * Falls back to the legacy `onboarding_completed_at` timestamp so tenants
     * that completed onboarding before Iris existed are not blocked.
     */
    public function isIrisComplete(PortalTenant $tenant): bool
    {
        if ($tenant->onboarding_completed_at !== null) {
            return true;
        }

        return AgentOnboardingState::where('tenant_id', $tenant->id)
            ->where('agent_name', 'iris')
            ->where('state', 'completed')
            ->exists();
    }

    /**
     * Get all onboarding states for a tenant, keyed by agent_name.
     *
     * @return Collection<int, AgentOnboardingState>
     */
    public function getAllStates(PortalTenant $tenant): Collection
    {
        return AgentOnboardingState::where('tenant_id', $tenant->id)->get();
    }

    /**
     * Mark an agent's onboarding as started.
     */
    public function markStarted(PortalTenant $tenant, string $agentName, User $user): AgentOnboardingState
    {
        $state = $this->getOrCreateState($tenant, $agentName);

        if ($state->state === 'not_started' || $state->state === 'failed') {
            $state->update([
                'state' => 'in_progress',
                'started_at' => $state->started_at ?? now(),
            ]);

            $this->log($tenant, $agentName, 'onboarding_started', $user);
        }

        return $state->fresh();
    }

    /**
     * Mark an agent's onboarding as completed.
     */
    public function markCompleted(PortalTenant $tenant, string $agentName, User $user): AgentOnboardingState
    {
        $state = $this->getOrCreateState($tenant, $agentName);

        $state->update([
            'state' => 'completed',
            'started_at' => $state->started_at ?? now(),
            'completed_at' => now(),
        ]);

        $this->log($tenant, $agentName, 'onboarding_completed', $user);

        return $state->fresh();
    }

    /**
     * Reset an agent's onboarding state back to not_started.
     *
     * Callers must verify admin role before calling this method.
     */
    public function reset(PortalTenant $tenant, string $agentName, User $user): void
    {
        AgentOnboardingState::where('tenant_id', $tenant->id)
            ->where('agent_name', $agentName)
            ->delete();

        $this->log($tenant, $agentName, 'onboarding_reset', $user, [
            'reset_by' => $user->id,
        ]);
    }

    /**
     * Write an onboarding audit log entry.
     *
     * @param  array<string, mixed>  $metadata
     */
    public function log(
        PortalTenant $tenant,
        ?string $agentName,
        string $event,
        User $user,
        array $metadata = []
    ): void {
        OnboardingAuditLog::create([
            'tenant_id' => $tenant->id,
            'agent_name' => $agentName,
            'event' => $event,
            'user_id' => $user->id,
            'metadata' => $metadata ?: null,
        ]);
    }
}
