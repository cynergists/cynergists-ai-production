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
        try {
            \Log::info('=== afterCreate START ===', [
                'user_id' => $this->record->id,
                'user_email' => $this->record->email,
            ]);

            // Create roles
            $selectedRoles = $this->data['roles'] ?? [];
            \Log::info('Creating roles', ['roles' => $selectedRoles]);

            foreach ($selectedRoles as $role) {
                UserRole::create([
                    'user_id' => $this->record->id,
                    'role' => $role,
                ]);
            }
            \Log::info('Roles created successfully');

            // Generate temporary password if none was provided
            $password = $this->data['password'] ?? null;
            \Log::info('Password check', [
                'has_password' => !empty($password),
                'password_length' => $password ? strlen($password) : 0,
            ]);

            if (!$password) {
                // Generate a random temporary password
                $password = \Str::password(12);
                \Log::info('Generated temporary password', ['length' => strlen($password)]);

                // Save the password to the user
                $this->record->update(['password' => $password]);
                \Log::info('Password saved to user');
            }

            // Send welcome email with the password
            \Log::info('Firing email event', ['password_length' => strlen($password)]);
            app(EventEmailService::class)->fire('user_created', [
                'user' => $this->record,
                'password' => $password,
            ]);
            \Log::info('Email event fired successfully');

            $this->notify('success', 'New User Created');
            \Log::info('=== afterCreate SUCCESS ===');
        } catch (\Throwable $e) {
            \Log::error('=== afterCreate FAILED ===', [
                'user_id' => $this->record->id ?? 'unknown',
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);

            $this->notify('danger', 'ERROR: ' . $e->getMessage());
            throw $e;
        }
    }
}
