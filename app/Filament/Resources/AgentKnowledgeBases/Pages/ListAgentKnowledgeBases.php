<?php

namespace App\Filament\Resources\AgentKnowledgeBases\Pages;

use App\Filament\Resources\AgentKnowledgeBases\AgentKnowledgeBaseResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListAgentKnowledgeBases extends ListRecords
{
    protected static string $resource = AgentKnowledgeBaseResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
