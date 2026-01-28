<?php

namespace App\Filament\Resources\PortalRoadmapItems\Pages;

use App\Filament\Resources\PortalRoadmapItems\PortalRoadmapItemResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditPortalRoadmapItem extends EditRecord
{
    protected static string $resource = PortalRoadmapItemResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
