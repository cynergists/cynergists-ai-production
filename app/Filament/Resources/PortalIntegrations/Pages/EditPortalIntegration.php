<?php

namespace App\Filament\Resources\PortalIntegrations\Pages;

use App\Filament\Resources\PortalIntegrations\PortalIntegrationResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditPortalIntegration extends EditRecord
{
    protected static string $resource = PortalIntegrationResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
