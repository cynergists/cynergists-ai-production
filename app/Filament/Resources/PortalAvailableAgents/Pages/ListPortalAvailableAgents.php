<?php

namespace App\Filament\Resources\PortalAvailableAgents\Pages;

use App\Filament\Resources\PortalAvailableAgents\PortalAvailableAgentResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListPortalAvailableAgents extends ListRecords
{
    protected static string $resource = PortalAvailableAgentResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
