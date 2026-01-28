<?php

namespace App\Filament\Resources\Staff\Schemas;

use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class StaffForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->required(),
                TextInput::make('title'),
                TextInput::make('status')
                    ->required()
                    ->default('active'),
                DatePicker::make('start_date'),
                DatePicker::make('end_date'),
                TextInput::make('hourly_pay')
                    ->numeric(),
                TextInput::make('hours_per_week')
                    ->numeric(),
                TextInput::make('monthly_pay')
                    ->numeric(),
                TextInput::make('email')
                    ->label('Email address')
                    ->email(),
                TextInput::make('phone')
                    ->tel(),
                TextInput::make('city'),
                TextInput::make('country'),
                TextInput::make('account_type'),
                TextInput::make('bank_name'),
                TextInput::make('account_number'),
                TextInput::make('routing_number'),
            ]);
    }
}
