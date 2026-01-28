<?php

namespace App\Filament\Resources\StaffHours\Pages;

use App\Filament\Resources\StaffHours\StaffHourResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListStaffHours extends ListRecords
{
    protected static string $resource = StaffHourResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
