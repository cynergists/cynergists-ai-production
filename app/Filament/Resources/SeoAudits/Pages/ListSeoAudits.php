<?php

namespace App\Filament\Resources\SeoAudits\Pages;

use App\Filament\Resources\SeoAudits\SeoAuditResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListSeoAudits extends ListRecords
{
    protected static string $resource = SeoAuditResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
