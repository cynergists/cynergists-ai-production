<?php

namespace App\Filament\Resources\Users\Pages;

use App\Filament\Resources\Users\UserResource;
use App\Models\UserRole;
use App\Services\EventEmailService;
use Filament\Resources\Pages\CreateRecord;
use Filament\Support\Enums\Width;
use Illuminate\Support\Facades\Log;
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

        try {
            // Generate temporary password if none was provided
            $password = $this->data['password'] ?? null;

            if (!$password) {
                // Generate a random temporary password
                $password = \Str::password(12);

                // Save the password to the user
                $this->record->update(['password' => $password]);
            }

            // Send welcome email with the password
            app(EventEmailService::class)->fire('user_created', [
                'user' => $this->record,
                'password' => $password,
            ]);

            $this->notify('success', 'New User Created');
        } catch (\Throwable $e) {
            \Log::error('Failed to send welcome email', [
                'user_id' => $this->record->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            $this->notify('warning', 'User created, but welcome email failed. Error: ' . $e->getMessage());
        }
    }
}
