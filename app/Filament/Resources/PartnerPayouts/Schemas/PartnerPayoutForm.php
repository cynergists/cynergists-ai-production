<?php

namespace App\Filament\Resources\PartnerPayouts\Schemas;

use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class PartnerPayoutForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('partner_id')
                    ->relationship('partner', 'id')
                    ->required(),
                DatePicker::make('period_start'),
                DatePicker::make('period_end'),
                TextInput::make('gross_amount')
                    ->required()
                    ->numeric()
                    ->default(0.0),
                TextInput::make('net_amount')
                    ->required()
                    ->numeric()
                    ->default(0.0),
                TextInput::make('status')
                    ->required()
                    ->default('pending'),
                Select::make('payout_method_id')
                    ->relationship('payoutMethod', 'id'),
                TextInput::make('payout_reference'),
                DateTimePicker::make('processed_at'),
            ]);
    }
}
