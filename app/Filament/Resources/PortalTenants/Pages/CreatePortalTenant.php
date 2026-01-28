<?php

namespace App\Filament\Resources\PortalTenants\Pages;

use App\Filament\Resources\PortalTenants\PortalTenantResource;
use Filament\Resources\Pages\CreateRecord;

class CreatePortalTenant extends CreateRecord
{
    protected static string $resource = PortalTenantResource::class;
}
