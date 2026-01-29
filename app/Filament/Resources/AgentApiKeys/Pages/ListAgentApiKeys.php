<?php

namespace App\Filament\Resources\AgentApiKeys\Pages;

use App\Filament\Resources\AgentApiKeys\AgentApiKeyResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListAgentApiKeys extends ListRecords
{
    protected static string $resource = AgentApiKeyResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
