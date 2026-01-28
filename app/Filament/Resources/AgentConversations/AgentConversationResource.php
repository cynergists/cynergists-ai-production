<?php

namespace App\Filament\Resources\AgentConversations;

use App\Filament\Resources\AgentConversations\Pages\CreateAgentConversation;
use App\Filament\Resources\AgentConversations\Pages\EditAgentConversation;
use App\Filament\Resources\AgentConversations\Pages\ListAgentConversations;
use App\Filament\Resources\AgentConversations\Schemas\AgentConversationForm;
use App\Filament\Resources\AgentConversations\Tables\AgentConversationsTable;
use App\Models\AgentConversation;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class AgentConversationResource extends Resource
{
    protected static ?string $model = AgentConversation::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedChatBubbleLeftRight;

    protected static string|\UnitEnum|null $navigationGroup = 'AI Agents';

    protected static ?int $navigationSort = 2;

    protected static ?string $navigationLabel = 'Conversations';

    public static function form(Schema $schema): Schema
    {
        return AgentConversationForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return AgentConversationsTable::configure($table);
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
            'index' => ListAgentConversations::route('/'),
            'create' => CreateAgentConversation::route('/create'),
            'edit' => EditAgentConversation::route('/{record}/edit'),
        ];
    }
}
