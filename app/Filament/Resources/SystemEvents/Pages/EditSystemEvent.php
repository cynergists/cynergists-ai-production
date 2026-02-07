<?php

namespace App\Filament\Resources\SystemEvents\Pages;

use App\Filament\Resources\SystemEvents\SystemEventResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditSystemEvent extends EditRecord
{
    protected static string $resource = SystemEventResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
