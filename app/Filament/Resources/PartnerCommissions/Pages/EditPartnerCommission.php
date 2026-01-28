<?php

namespace App\Filament\Resources\PartnerCommissions\Pages;

use App\Filament\Resources\PartnerCommissions\PartnerCommissionResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditPartnerCommission extends EditRecord
{
    protected static string $resource = PartnerCommissionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
