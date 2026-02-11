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
            // Debug logging
            \Log::info('afterCreate called', [
                'user_id' => $this->record->id,
                'has_password' => isset($this->data['password']),
                'password_value' => $this->data['password'] ?? 'NOT SET',
                'password_empty' => empty($this->data['password']),
            ]);

            // Send welcome email - with password or password creation link
            if (!isset($this->data['password']) || empty($this->data['password'])) {
                \Log::info('Sending email with password reset link');

                app(EventEmailService::class)->fire('user_created', [
                    'user' => $this->record,
                    'generate_password_reset_link' => true,
                ]);

                $this->notify('success', 'User created successfully. Welcome email with password creation link has been sent to ' . $this->record->email);
            } else {
                \Log::info('Sending email with password', [
                    'password' => $this->data['password'],
                ]);

                app(EventEmailService::class)->fire('user_created', [
                    'user' => $this->record,
                    'password' => $this->data['password'],
                ]);

                $this->notify('success', 'User created successfully. Welcome email with password has been sent to ' . $this->record->email);
            }
        } catch (\Throwable $e) {
            \Log::error('Failed to send welcome email', [
                'user_id' => $this->record->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            $this->notify('warning', 'User created successfully, but the welcome email could not be sent. Error: ' . $e->getMessage());
        }
    }
}
