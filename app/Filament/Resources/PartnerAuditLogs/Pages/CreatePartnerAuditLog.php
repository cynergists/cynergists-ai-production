<?php

namespace App\Filament\Resources\PartnerAuditLogs\Pages;

use App\Filament\Resources\PartnerAuditLogs\PartnerAuditLogResource;
use Filament\Resources\Pages\CreateRecord;

class CreatePartnerAuditLog extends CreateRecord
{
    protected static string $resource = PartnerAuditLogResource::class;
}
