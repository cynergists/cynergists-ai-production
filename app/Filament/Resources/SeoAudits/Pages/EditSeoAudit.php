<?php

namespace App\Filament\Resources\SeoAudits\Pages;

use App\Filament\Resources\SeoAudits\SeoAuditResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditSeoAudit extends EditRecord
{
    protected static string $resource = SeoAuditResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
