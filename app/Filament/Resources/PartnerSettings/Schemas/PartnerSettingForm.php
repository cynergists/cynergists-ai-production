<?php

namespace App\Filament\Resources\PartnerSettings\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class PartnerSettingForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('global_discount_percent')
                    ->required()
                    ->numeric()
                    ->default(0.0),
                TextInput::make('updated_by'),
            ]);
    }
}
