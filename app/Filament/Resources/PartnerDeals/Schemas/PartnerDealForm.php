<?php

namespace App\Filament\Resources\PartnerDeals\Schemas;

use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class PartnerDealForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('referral_id')
                    ->relationship('referral', 'id'),
                Select::make('partner_id')
                    ->relationship('partner', 'id')
                    ->required(),
                TextInput::make('client_id'),
                TextInput::make('client_name')
                    ->required(),
                TextInput::make('client_email')
                    ->email(),
                TextInput::make('stage')
                    ->required()
                    ->default('new'),
                TextInput::make('deal_value')
                    ->required()
                    ->numeric()
                    ->default(0.0),
                DatePicker::make('expected_close_date'),
                DateTimePicker::make('closed_at'),
                Textarea::make('notes')
                    ->columnSpanFull(),
            ]);
    }
}
