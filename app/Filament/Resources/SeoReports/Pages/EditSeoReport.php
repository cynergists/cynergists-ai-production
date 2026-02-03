<?php

namespace App\Filament\Resources\SeoReports\Pages;

use App\Filament\Resources\SeoReports\SeoReportResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditSeoReport extends EditRecord
{
    protected static string $resource = SeoReportResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
