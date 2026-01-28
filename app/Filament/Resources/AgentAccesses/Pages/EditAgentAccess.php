<?php

namespace App\Filament\Resources\AgentAccesses\Pages;

use App\Filament\Resources\AgentAccesses\AgentAccessResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditAgentAccess extends EditRecord
{
    protected static string $resource = AgentAccessResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
