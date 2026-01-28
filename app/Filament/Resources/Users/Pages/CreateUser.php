<?php

namespace App\Filament\Resources\Users\Pages;

use App\Filament\Resources\Users\UserResource;
use App\Models\UserRole;
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
        $selectedRoles = $this->data['roles'] ?? [];

        foreach ($selectedRoles as $role) {
            UserRole::create([
                'user_id' => $this->record->id,
                'role' => $role,
            ]);
        }
    }
}
