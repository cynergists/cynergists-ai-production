<?php

namespace App\Filament\Resources\AgentApiKeys;

use App\Filament\Resources\AgentApiKeys\Pages\CreateAgentApiKey;
use App\Filament\Resources\AgentApiKeys\Pages\EditAgentApiKey;
use App\Filament\Resources\AgentApiKeys\Pages\ListAgentApiKeys;
use App\Filament\Resources\AgentApiKeys\Schemas\AgentApiKeyForm;
use App\Filament\Resources\AgentApiKeys\Tables\AgentApiKeysTable;
use App\Models\AgentApiKey;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class AgentApiKeyResource extends Resource
{
    protected static ?string $model = AgentApiKey::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedKey;

    protected static string|\UnitEnum|null $navigationGroup = 'AI Agents';

    protected static ?int $navigationSort = 6;

    protected static ?string $navigationLabel = 'API Keys';

    public static function form(Schema $schema): Schema
    {
        return AgentApiKeyForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return AgentApiKeysTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListAgentApiKeys::route('/'),
            'create' => CreateAgentApiKey::route('/create'),
            'edit' => EditAgentApiKey::route('/{record}/edit'),
        ];
    }
}
