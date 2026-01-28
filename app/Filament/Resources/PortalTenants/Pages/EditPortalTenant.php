<?php

namespace App\Filament\Resources\PortalTenants\Pages;

use App\Filament\Resources\PortalTenants\PortalTenantResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditPortalTenant extends EditRecord
{
    protected static string $resource = PortalTenantResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
