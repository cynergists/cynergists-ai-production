<?php

namespace App\Filament\Resources\AgentAccesses;

use App\Filament\Resources\AgentAccesses\Pages\CreateAgentAccess;
use App\Filament\Resources\AgentAccesses\Pages\EditAgentAccess;
use App\Filament\Resources\AgentAccesses\Pages\ListAgentAccesses;
use App\Filament\Resources\AgentAccesses\Schemas\AgentAccessForm;
use App\Filament\Resources\AgentAccesses\Tables\AgentAccessesTable;
use App\Models\AgentAccess;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class AgentAccessResource extends Resource
{
    protected static ?string $model = AgentAccess::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedKey;

    protected static string|\UnitEnum|null $navigationGroup = 'AI Agents';

    protected static ?int $navigationSort = 2;

    protected static ?string $navigationLabel = 'Access Control';

    public static function form(Schema $schema): Schema
    {
        return AgentAccessForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return AgentAccessesTable::configure($table);
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
            'index' => ListAgentAccesses::route('/'),
            'create' => CreateAgentAccess::route('/create'),
            'edit' => EditAgentAccess::route('/{record}/edit'),
        ];
    }
}
