<?php

namespace App\Filament\Resources\PartnerTicketMessages\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class PartnerTicketMessageForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('ticket_id')
                    ->relationship('ticket', 'id')
                    ->required(),
                TextInput::make('sender_id'),
                TextInput::make('sender_type')
                    ->required()
                    ->default('partner'),
                Textarea::make('message')
                    ->required()
                    ->columnSpanFull(),
                TextInput::make('attachments'),
            ]);
    }
}
