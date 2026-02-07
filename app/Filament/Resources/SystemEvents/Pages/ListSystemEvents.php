<?php

namespace App\Filament\Resources\SystemEvents\Pages;

use App\Filament\Resources\SystemEvents\SystemEventResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListSystemEvents extends ListRecords
{
    protected static string $resource = SystemEventResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
