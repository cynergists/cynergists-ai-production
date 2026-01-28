<?php

namespace App\Filament\Resources\AgentAccesses\Pages;

use App\Filament\Resources\AgentAccesses\AgentAccessResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListAgentAccesses extends ListRecords
{
    protected static string $resource = AgentAccessResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
