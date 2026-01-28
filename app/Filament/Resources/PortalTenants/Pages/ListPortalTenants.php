<?php

namespace App\Filament\Resources\PortalTenants\Pages;

use App\Filament\Resources\PortalTenants\PortalTenantResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListPortalTenants extends ListRecords
{
    protected static string $resource = PortalTenantResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
