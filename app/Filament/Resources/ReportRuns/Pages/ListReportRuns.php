<?php

namespace App\Filament\Resources\ReportRuns\Pages;

use App\Filament\Resources\ReportRuns\ReportRunResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListReportRuns extends ListRecords
{
    protected static string $resource = ReportRunResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
