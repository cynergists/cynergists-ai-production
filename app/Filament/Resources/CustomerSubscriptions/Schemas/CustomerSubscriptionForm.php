<?php

namespace App\Filament\Resources\CustomerSubscriptions\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class CustomerSubscriptionForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('customer_id')
                    ->required(),
                TextInput::make('product_id')
                    ->required(),
                TextInput::make('payment_id'),
                TextInput::make('status')
                    ->required()
                    ->default('active'),
                TextInput::make('tier')
                    ->required()
                    ->default('basic'),
                DateTimePicker::make('start_date')
                    ->required(),
                DateTimePicker::make('end_date'),
                Toggle::make('auto_renew')
                    ->required(),
                Select::make('tenant_id')
                    ->relationship('tenant', 'id'),
            ]);
    }
}
