<?php

namespace App\Filament\Resources\PartnerPayoutMethods\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class PartnerPayoutMethodForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('partner_id')
                    ->relationship('partner', 'id')
                    ->required(),
                TextInput::make('method_type')
                    ->required()
                    ->default('ach'),
                Textarea::make('token_reference')
                    ->columnSpanFull(),
                TextInput::make('last_four_digits'),
                TextInput::make('bank_name'),
                Toggle::make('is_default')
                    ->required(),
                Toggle::make('is_verified')
                    ->required(),
            ]);
    }
}
