<?php

namespace App\Filament\Resources\AgentConversations\Pages;

use App\Filament\Resources\AgentConversations\AgentConversationResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListAgentConversations extends ListRecords
{
    protected static string $resource = AgentConversationResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
