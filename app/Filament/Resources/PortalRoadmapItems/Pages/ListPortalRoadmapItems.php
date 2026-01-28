<?php

namespace App\Filament\Resources\PortalRoadmapItems\Pages;

use App\Filament\Resources\PortalRoadmapItems\PortalRoadmapItemResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListPortalRoadmapItems extends ListRecords
{
    protected static string $resource = PortalRoadmapItemResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
