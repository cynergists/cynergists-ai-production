<?php

namespace App\Filament\Resources\PortalAvailableAgents\Pages;

use App\Filament\Resources\PortalAvailableAgents\PortalAvailableAgentResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditPortalAvailableAgent extends EditRecord
{
    protected static string $resource = PortalAvailableAgentResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
