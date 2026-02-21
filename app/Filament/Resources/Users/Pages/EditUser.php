<?php

namespace App\Filament\Resources\Users\Pages;

use App\Filament\Resources\Users\UserResource;
use App\Models\AgentAccess;
use App\Models\CustomerSubscription;
use App\Models\PortalAvailableAgent;
use App\Models\PortalTenant;
use App\Models\UserRole;
use App\Services\EventEmailService;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\EditRecord;
use Filament\Support\Enums\Width;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class EditUser extends EditRecord
{
    protected static string $resource = UserResource::class;

    public function getMaxContentWidth(): Width
    {
        return Width::Full;
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('sendWelcomeEmail')
                ->label('Send Welcome Email')
                ->icon('heroicon-o-paper-airplane')
                ->color('success')
                ->requiresConfirmation()
                ->modalHeading('Send Welcome Email')
                ->modalDescription(fn (): string => "Send a welcome email with password creation link to {$this->record->email}?")
                ->action(function (): void {
                    app(EventEmailService::class)->fire('user_created', [
                        'user' => $this->record,
                        'generate_password_reset_link' => true,
                    ]);

                    Notification::make()
                        ->success()
                        ->title('Welcome email sent')
                        ->body("Welcome email with password creation link sent to {$this->record->email}.")
                        ->send();
                }),
            Action::make('sendPasswordReset')
                ->label('Send Password Reset')
                ->icon('heroicon-o-envelope')
                ->color('warning')
                ->requiresConfirmation()
                ->modalHeading('Send Password Reset Email')
                ->modalDescription(fn (): string => "Send a password reset link to {$this->record->email}?")
                ->action(function (): void {
                    $status = Password::sendResetLink(
                        ['email' => $this->record->email],
                    );

                    if ($status === Password::RESET_LINK_SENT) {
                        Notification::make()
                            ->success()
                            ->title('Password reset link sent')
                            ->body("A reset link has been sent to {$this->record->email}.")
                            ->send();
                    } else {
                        Notification::make()
                            ->danger()
                            ->title('Failed to send reset link')
                            ->body(__($status))
                            ->send();
                    }
                }),
            DeleteAction::make(),
        ];
    }

    protected function mutateFormDataBeforeFill(array $data): array
    {
        // Load roles
        $data['roles'] = $this->normalizeRoles(
            $this->record->userRoles()->pluck('role')->toArray(),
        );

        // Load agents - get the agent IDs from portal_available_agents that match agent_name in agent_access
        $tenant = PortalTenant::forUser($this->record);
        if ($tenant) {
            $agentNames = AgentAccess::query()
                ->where('tenant_id', $tenant->id)
                ->where('is_active', true)
                ->pluck('agent_name')
                ->toArray();

            $data['agents'] = PortalAvailableAgent::query()
                ->whereIn('name', $agentNames)
                ->pluck('id')
                ->toArray();
        } else {
            $data['agents'] = [];
        }

        return $data;
    }

    protected function afterSave(): void
    {
        $this->syncRoles();
        $this->syncAgents();
    }

    private function syncRoles(): void
    {
        $selectedRoles = $this->normalizeRoles($this->data['roles'] ?? []);
        $currentRoles = $this->normalizeRoles(
            $this->record->userRoles()->pluck('role')->toArray(),
        );

        // Remove roles that were unchecked
        $rolesToRemove = array_diff($currentRoles, $selectedRoles);
        if (! empty($rolesToRemove)) {
            $this->record->userRoles()->whereIn('role', $rolesToRemove)->delete();
        }

        // Add new roles
        $rolesToAdd = array_diff($selectedRoles, $currentRoles);
        foreach ($rolesToAdd as $role) {
            UserRole::create([
                'user_id' => $this->record->id,
                'role' => $role,
            ]);
        }
    }

    /**
     * @param  array<int, string>  $roles
     * @return array<int, string>
     */
    private function normalizeRoles(array $roles): array
    {
        $allowedRoles = ['admin', 'client', 'sales_rep'];
        $filteredRoles = array_values(array_intersect($roles, $allowedRoles));

        if (! in_array('client', $filteredRoles, true)) {
            $filteredRoles[] = 'client';
        }

        return array_values(array_unique($filteredRoles));
    }

    private function syncAgents(): void
    {
        $selectedAgentIds = $this->data['agents'] ?? [];

        // Get selected agent details
        $selectedAgents = PortalAvailableAgent::query()
            ->whereIn('id', $selectedAgentIds)
            ->get();

        $selectedAgentNames = $selectedAgents->pluck('name')->toArray();

        // Get or create tenant
        $tenant = PortalTenant::forUser($this->record);

        // If no agents selected and no tenant, nothing to do
        if (empty($selectedAgentIds) && ! $tenant) {
            return;
        }

        // If agents selected but no tenant, create one
        if (! empty($selectedAgentIds) && ! $tenant) {
            $tenant = $this->createTenant();
        }

        // If we have a tenant, sync agents
        if ($tenant) {
            $subscription = $this->getOrCreateSubscription($tenant);

            // Get current agent names
            $currentAgentNames = AgentAccess::query()
                ->where('tenant_id', $tenant->id)
                ->pluck('agent_name')
                ->toArray();

            // Remove agents that were unchecked
            $agentsToRemove = array_diff($currentAgentNames, $selectedAgentNames);
            if (! empty($agentsToRemove)) {
                AgentAccess::query()
                    ->where('tenant_id', $tenant->id)
                    ->whereIn('agent_name', $agentsToRemove)
                    ->delete();
            }

            // Add new agents
            $agentsToAdd = array_diff($selectedAgentNames, $currentAgentNames);
            foreach ($selectedAgents as $agent) {
                if (in_array($agent->name, $agentsToAdd)) {
                    AgentAccess::create([
                        'id' => (string) Str::uuid(),
                        'subscription_id' => $subscription->id,
                        'customer_id' => $tenant->id,
                        'agent_type' => $agent->category ?: 'general',
                        'agent_name' => $agent->name,
                        'configuration' => [],
                        'is_active' => true,
                        'usage_count' => 0,
                        'usage_limit' => null,
                        'last_used_at' => null,
                        'tenant_id' => $tenant->id,
                    ]);
                }
            }
        }
    }

    private function createTenant(): PortalTenant
    {
        $base = Str::slug(Str::before($this->record->email, '@'));
        if ($base === '') {
            $base = 'portal-user';
        }

        $subdomain = $base;
        $suffix = 1;
        while (PortalTenant::query()->where('subdomain', $subdomain)->exists()) {
            $subdomain = $base.'-'.$suffix;
            $suffix++;
        }

        return PortalTenant::create([
            'id' => (string) Str::uuid(),
            'user_id' => (string) $this->record->id,
            'company_name' => $this->record->name ?: 'Portal Client',
            'subdomain' => $subdomain,
            'is_temp_subdomain' => false,
            'logo_url' => null,
            'primary_color' => '#22c55e',
            'settings' => [],
            'status' => 'active',
            'onboarding_completed_at' => now(),
        ]);
    }

    private function getOrCreateSubscription(PortalTenant $tenant): CustomerSubscription
    {
        $subscription = CustomerSubscription::query()
            ->where('tenant_id', $tenant->id)
            ->where('status', 'active')
            ->first();

        if ($subscription) {
            return $subscription;
        }

        return CustomerSubscription::create([
            'id' => (string) Str::uuid(),
            'customer_id' => $tenant->id,
            'product_id' => (string) Str::uuid(),
            'payment_id' => null,
            'status' => 'active',
            'tier' => 'starter',
            'start_date' => now(),
            'end_date' => now()->addYear(),
            'auto_renew' => false,
            'tenant_id' => $tenant->id,
        ]);
    }
}
