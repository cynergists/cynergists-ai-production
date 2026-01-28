<?php

namespace App\Filament\Resources\AgentConversations\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class AgentConversationForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('agent_access_id')
                    ->required(),
                TextInput::make('customer_id')
                    ->required(),
                TextInput::make('title'),
                TextInput::make('messages'),
                TextInput::make('status')
                    ->required()
                    ->default('active'),
                Select::make('tenant_id')
                    ->relationship('tenant', 'id'),
            ]);
    }
}
