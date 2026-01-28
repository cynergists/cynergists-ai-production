<?php

namespace App\Filament\Resources\PartnerAuditLogs\Pages;

use App\Filament\Resources\PartnerAuditLogs\PartnerAuditLogResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditPartnerAuditLog extends EditRecord
{
    protected static string $resource = PartnerAuditLogResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
