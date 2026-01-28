<?php

namespace App\Filament\Resources\AgentConversations\Pages;

use App\Filament\Resources\AgentConversations\AgentConversationResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditAgentConversation extends EditRecord
{
    protected static string $resource = AgentConversationResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
