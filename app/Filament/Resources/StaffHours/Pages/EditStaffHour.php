<?php

namespace App\Filament\Resources\StaffHours\Pages;

use App\Filament\Resources\StaffHours\StaffHourResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditStaffHour extends EditRecord
{
    protected static string $resource = StaffHourResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
