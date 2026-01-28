<?php

namespace App\Filament\Resources\PartnerCommissions\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class PartnerCommissionForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('partner_id')
                    ->relationship('partner', 'id')
                    ->required(),
                Select::make('deal_id')
                    ->relationship('deal', 'id'),
                Select::make('payment_id')
                    ->relationship('payment', 'id'),
                TextInput::make('commission_rate')
                    ->required()
                    ->numeric()
                    ->default(0.2),
                TextInput::make('gross_amount')
                    ->required()
                    ->numeric(),
                TextInput::make('net_amount')
                    ->required()
                    ->numeric(),
                TextInput::make('status')
                    ->required()
                    ->default('pending'),
                DateTimePicker::make('clawback_eligible_until'),
                Select::make('payout_id')
                    ->relationship('payout', 'id'),
            ]);
    }
}
