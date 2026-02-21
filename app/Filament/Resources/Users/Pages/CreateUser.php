<?php

namespace App\Filament\Resources\Users\Pages;

use App\Filament\Resources\Users\UserResource;
use App\Models\UserRole;
use App\Services\EventEmailService;
use Filament\Resources\Pages\CreateRecord;
use Filament\Support\Enums\Width;

class CreateUser extends CreateRecord
{
    protected static string $resource = UserResource::class;

    public function getMaxContentWidth(): Width
    {
        return Width::Full;
    }

    protected function afterCreate(): void
    {
        $selectedRoles = $this->normalizeRoles($this->data['roles'] ?? []);

        foreach ($selectedRoles as $role) {
            UserRole::create([
                'user_id' => $this->record->id,
                'role' => $role,
            ]);
        }

        // Send welcome email with password creation link
        app(EventEmailService::class)->fire('user_created', [
            'user' => $this->record,
            'generate_password_reset_link' => true,
        ]);
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
}
