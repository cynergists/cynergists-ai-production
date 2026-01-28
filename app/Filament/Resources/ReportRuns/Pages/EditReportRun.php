<?php

namespace App\Filament\Resources\ReportRuns\Pages;

use App\Filament\Resources\ReportRuns\ReportRunResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditReportRun extends EditRecord
{
    protected static string $resource = ReportRunResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
