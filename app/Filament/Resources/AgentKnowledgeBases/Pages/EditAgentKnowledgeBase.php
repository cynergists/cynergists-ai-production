<?php

namespace App\Filament\Resources\AgentKnowledgeBases\Pages;

use App\Filament\Resources\AgentKnowledgeBases\AgentKnowledgeBaseResource;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Resources\Pages\EditRecord;

class EditAgentKnowledgeBase extends EditRecord
{
    protected static string $resource = AgentKnowledgeBaseResource::class;

    protected function getHeaderActions(): array
    {
        return [
            ViewAction::make(),
            DeleteAction::make(),
        ];
    }

    protected function mutateFormDataBeforeSave(array $data): array
    {
        $data['last_updated_by_user_at'] = now();

        return $data;
    }
}
