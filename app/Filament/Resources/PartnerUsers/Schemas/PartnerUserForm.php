<?php

namespace App\Filament\Resources\PartnerUsers\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class PartnerUserForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('partner_id')
                    ->relationship('partner', 'id')
                    ->required(),
                Select::make('user_id')
                    ->relationship('user', 'name')
                    ->required(),
                TextInput::make('role')
                    ->required()
                    ->default('owner'),
            ]);
    }
}
