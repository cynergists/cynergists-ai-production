<?php

namespace App\Filament\Resources\AgentAccesses\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class AgentAccessForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('subscription_id')
                    ->relationship('subscription', 'id')
                    ->required(),
                TextInput::make('customer_id')
                    ->required(),
                TextInput::make('agent_type')
                    ->required(),
                TextInput::make('agent_name')
                    ->required(),
                TextInput::make('configuration'),
                Toggle::make('is_active')
                    ->required(),
                TextInput::make('usage_count')
                    ->required()
                    ->numeric()
                    ->default(0),
                TextInput::make('usage_limit')
                    ->numeric(),
                DateTimePicker::make('last_used_at'),
                Select::make('tenant_id')
                    ->relationship('tenant', 'id'),
            ]);
    }
}
