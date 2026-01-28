<?php

namespace App\Filament\Resources\AgentMemories;

use App\Filament\Resources\AgentMemories\Pages\CreateAgentMemory;
use App\Filament\Resources\AgentMemories\Pages\EditAgentMemory;
use App\Filament\Resources\AgentMemories\Pages\ListAgentMemories;
use App\Filament\Resources\AgentMemories\Schemas\AgentMemoryForm;
use App\Filament\Resources\AgentMemories\Tables\AgentMemoriesTable;
use App\Models\AgentMemory;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class AgentMemoryResource extends Resource
{
    protected static ?string $model = AgentMemory::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedCircleStack;

    protected static string|\UnitEnum|null $navigationGroup = 'AI Agents';

    protected static ?int $navigationSort = 4;

    protected static ?string $navigationLabel = 'Memories';

    public static function form(Schema $schema): Schema
    {
        return AgentMemoryForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return AgentMemoriesTable::configure($table);
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
            'index' => ListAgentMemories::route('/'),
            'create' => CreateAgentMemory::route('/create'),
            'edit' => EditAgentMemory::route('/{record}/edit'),
        ];
    }
}
