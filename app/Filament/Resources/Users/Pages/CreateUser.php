<?php

namespace App\Filament\Resources\Users\Pages;

use App\Filament\Resources\Users\UserResource;
use App\Models\UserRole;
use App\Services\EventEmailService;
use Filament\Resources\Pages\CreateRecord;
use Filament\Support\Enums\Width;
use Illuminate\Support\Facades\Password;

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

        // Send welcome email - with password or password creation link
        if (empty($this->data['password'])) {
            app(EventEmailService::class)->fire('user_created', [
                'user' => $this->record,
                'generate_password_reset_link' => true,
            ]);

            $this->notify('success', 'User created successfully. Welcome email with password creation link has been sent to ' . $this->record->email);
        } else {
            app(EventEmailService::class)->fire('user_created', [
                'user' => $this->record,
                'password' => $this->data['password'],
            ]);

            $this->notify('success', 'User created successfully. Welcome email with password has been sent to ' . $this->record->email);
        }
    }
}
