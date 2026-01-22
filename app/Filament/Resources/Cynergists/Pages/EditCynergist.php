<?php

namespace App\Filament\Resources\Cynergists\Pages;

use App\Filament\Resources\Cynergists\CynergistResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditCynergist extends EditRecord
{
    protected static string $resource = CynergistResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
