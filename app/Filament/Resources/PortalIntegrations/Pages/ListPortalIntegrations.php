<?php

namespace App\Filament\Resources\PortalIntegrations\Pages;

use App\Filament\Resources\PortalIntegrations\PortalIntegrationResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListPortalIntegrations extends ListRecords
{
    protected static string $resource = PortalIntegrationResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
