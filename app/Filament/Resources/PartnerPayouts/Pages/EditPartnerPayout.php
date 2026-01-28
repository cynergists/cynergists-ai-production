<?php

namespace App\Filament\Resources\PartnerPayouts\Pages;

use App\Filament\Resources\PartnerPayouts\PartnerPayoutResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditPartnerPayout extends EditRecord
{
    protected static string $resource = PartnerPayoutResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
