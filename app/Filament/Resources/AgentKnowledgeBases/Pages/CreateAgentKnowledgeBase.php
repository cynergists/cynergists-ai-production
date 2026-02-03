<?php

namespace App\Filament\Resources\AgentKnowledgeBases\Pages;

use App\Filament\Resources\AgentKnowledgeBases\AgentKnowledgeBaseResource;
use Filament\Resources\Pages\CreateRecord;

class CreateAgentKnowledgeBase extends CreateRecord
{
    protected static string $resource = AgentKnowledgeBaseResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $data['last_updated_by_user_at'] = now();

        return $data;
    }
}
