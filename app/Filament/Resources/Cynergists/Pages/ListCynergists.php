<?php

namespace App\Filament\Resources\Cynergists\Pages;

use App\Filament\Resources\Cynergists\CynergistResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListCynergists extends ListRecords
{
    protected static string $resource = CynergistResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
