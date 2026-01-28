<?php

namespace App\Filament\Resources\AgentMemories\Pages;

use App\Filament\Resources\AgentMemories\AgentMemoryResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListAgentMemories extends ListRecords
{
    protected static string $resource = AgentMemoryResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
