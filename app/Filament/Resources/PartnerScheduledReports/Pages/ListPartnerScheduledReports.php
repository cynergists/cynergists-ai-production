<?php

namespace App\Filament\Resources\PartnerScheduledReports\Pages;

use App\Filament\Resources\PartnerScheduledReports\PartnerScheduledReportResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListPartnerScheduledReports extends ListRecords
{
    protected static string $resource = PartnerScheduledReportResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
