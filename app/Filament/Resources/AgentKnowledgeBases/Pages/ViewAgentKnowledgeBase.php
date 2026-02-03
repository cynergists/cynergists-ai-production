<?php

namespace App\Filament\Resources\AgentKnowledgeBases\Pages;

use App\Filament\Resources\AgentKnowledgeBases\AgentKnowledgeBaseResource;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;

class ViewAgentKnowledgeBase extends ViewRecord
{
    protected static string $resource = AgentKnowledgeBaseResource::class;

    protected function getHeaderActions(): array
    {
        return [
            EditAction::make(),
        ];
    }
}
