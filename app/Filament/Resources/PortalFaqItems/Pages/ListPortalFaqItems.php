<?php

namespace App\Filament\Resources\PortalFaqItems\Pages;

use App\Filament\Resources\PortalFaqItems\PortalFaqItemResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListPortalFaqItems extends ListRecords
{
    protected static string $resource = PortalFaqItemResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
