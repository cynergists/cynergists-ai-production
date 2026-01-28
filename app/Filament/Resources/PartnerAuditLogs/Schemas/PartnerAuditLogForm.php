<?php

namespace App\Filament\Resources\PartnerAuditLogs\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class PartnerAuditLogForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('partner_id')
                    ->relationship('partner', 'id')
                    ->required(),
                TextInput::make('event_type')
                    ->required(),
                TextInput::make('event_data'),
                TextInput::make('created_by'),
            ]);
    }
}
