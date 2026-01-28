<?php

namespace App\Filament\Resources\AgentSuggestions;

use App\Filament\Resources\AgentSuggestions\Pages\CreateAgentSuggestion;
use App\Filament\Resources\AgentSuggestions\Pages\EditAgentSuggestion;
use App\Filament\Resources\AgentSuggestions\Pages\ListAgentSuggestions;
use App\Filament\Resources\AgentSuggestions\Schemas\AgentSuggestionForm;
use App\Filament\Resources\AgentSuggestions\Tables\AgentSuggestionsTable;
use App\Models\AgentSuggestion;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class AgentSuggestionResource extends Resource
{
    protected static ?string $model = AgentSuggestion::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedLightBulb;

    protected static string|\UnitEnum|null $navigationGroup = 'AI Agents';

    protected static ?int $navigationSort = 4;

    protected static ?string $navigationLabel = 'Suggestions';

    public static function form(Schema $schema): Schema
    {
        return AgentSuggestionForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return AgentSuggestionsTable::configure($table);
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
            'index' => ListAgentSuggestions::route('/'),
            'create' => CreateAgentSuggestion::route('/create'),
            'edit' => EditAgentSuggestion::route('/{record}/edit'),
        ];
    }
}
