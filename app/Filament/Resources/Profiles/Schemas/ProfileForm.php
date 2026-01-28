<?php

namespace App\Filament\Resources\Profiles\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class ProfileForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('user_id')
                    ->relationship('user', 'name')
                    ->required(),
                TextInput::make('email')
                    ->label('Email address')
                    ->email()
                    ->required(),
                TextInput::make('first_name'),
                TextInput::make('last_name'),
                TextInput::make('company_name'),
                TextInput::make('phone')
                    ->tel(),
                TextInput::make('title'),
                TextInput::make('partnership_interest'),
                TextInput::make('referral_volume'),
                Select::make('status')
                    ->options(['active' => 'Active', 'pending' => 'Pending', 'suspended' => 'Suspended'])
                    ->default('active')
                    ->required(),
                DateTimePicker::make('last_login'),
            ]);
    }
}
