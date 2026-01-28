<?php

namespace App\Filament\Resources\PortalTenants\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class PortalTenantForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('user_id')
                    ->relationship('user', 'name')
                    ->required(),
                TextInput::make('company_name')
                    ->required(),
                TextInput::make('subdomain')
                    ->required(),
                Toggle::make('is_temp_subdomain')
                    ->required(),
                Textarea::make('logo_url')
                    ->columnSpanFull(),
                TextInput::make('primary_color')
                    ->required()
                    ->default('#22c55e'),
                TextInput::make('settings'),
                TextInput::make('status')
                    ->required()
                    ->default('active'),
                DateTimePicker::make('onboarding_completed_at'),
            ]);
    }
}
