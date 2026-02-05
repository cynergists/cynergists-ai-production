<?php

namespace App\Filament\Resources\AgentKnowledgeBases;

use App\Filament\Resources\AgentKnowledgeBases\Pages\CreateAgentKnowledgeBase;
use App\Filament\Resources\AgentKnowledgeBases\Pages\EditAgentKnowledgeBase;
use App\Filament\Resources\AgentKnowledgeBases\Pages\ListAgentKnowledgeBases;
use App\Filament\Resources\AgentKnowledgeBases\Pages\ViewAgentKnowledgeBase;
use App\Filament\Resources\AgentKnowledgeBases\Schemas\AgentKnowledgeBaseForm;
use App\Filament\Resources\AgentKnowledgeBases\Schemas\AgentKnowledgeBaseInfolist;
use App\Filament\Resources\AgentKnowledgeBases\Tables\AgentKnowledgeBasesTable;
use App\Models\AgentKnowledgeBase;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class AgentKnowledgeBaseResource extends Resource
{
    protected static ?string $model = AgentKnowledgeBase::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedBookOpen;

    protected static ?string $recordTitleAttribute = 'title';

    protected static ?string $navigationLabel = 'Knowledge Bases';

    public static function form(Schema $schema): Schema
    {
        return AgentKnowledgeBaseForm::configure($schema);
    }

    public static function infolist(Schema $schema): Schema
    {
        return AgentKnowledgeBaseInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return AgentKnowledgeBasesTable::configure($table);
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
            'index' => ListAgentKnowledgeBases::route('/'),
            'create' => CreateAgentKnowledgeBase::route('/create'),
            'view' => ViewAgentKnowledgeBase::route('/{record}'),
            'edit' => EditAgentKnowledgeBase::route('/{record}/edit'),
        ];
    }
}
