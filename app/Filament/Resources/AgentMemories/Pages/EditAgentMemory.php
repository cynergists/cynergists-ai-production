<?php

namespace App\Filament\Resources\AgentMemories\Pages;

use App\Filament\Resources\AgentMemories\AgentMemoryResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditAgentMemory extends EditRecord
{
    protected static string $resource = AgentMemoryResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
