<?php

namespace App\Filament\Resources\PartnerPayments\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class PartnerPaymentForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('deal_id')
                    ->relationship('deal', 'id'),
                TextInput::make('client_id'),
                Select::make('partner_id')
                    ->relationship('partner', 'id')
                    ->required(),
                TextInput::make('square_payment_id'),
                TextInput::make('amount')
                    ->required()
                    ->numeric(),
                TextInput::make('currency')
                    ->required()
                    ->default('USD'),
                TextInput::make('status')
                    ->required()
                    ->default('captured'),
                DateTimePicker::make('captured_at'),
                DateTimePicker::make('refunded_at'),
            ]);
    }
}
