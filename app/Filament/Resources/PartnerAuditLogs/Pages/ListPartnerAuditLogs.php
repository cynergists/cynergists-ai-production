<?php

namespace App\Filament\Resources\PartnerAuditLogs\Pages;

use App\Filament\Resources\PartnerAuditLogs\PartnerAuditLogResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListPartnerAuditLogs extends ListRecords
{
    protected static string $resource = PartnerAuditLogResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
