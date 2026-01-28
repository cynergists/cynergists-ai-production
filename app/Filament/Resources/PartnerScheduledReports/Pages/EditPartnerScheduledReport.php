<?php

namespace App\Filament\Resources\PartnerScheduledReports\Pages;

use App\Filament\Resources\PartnerScheduledReports\PartnerScheduledReportResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditPartnerScheduledReport extends EditRecord
{
    protected static string $resource = PartnerScheduledReportResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
