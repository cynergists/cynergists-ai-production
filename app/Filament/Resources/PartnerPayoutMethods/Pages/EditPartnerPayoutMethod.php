<?php

namespace App\Filament\Resources\PartnerPayoutMethods\Pages;

use App\Filament\Resources\PartnerPayoutMethods\PartnerPayoutMethodResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditPartnerPayoutMethod extends EditRecord
{
    protected static string $resource = PartnerPayoutMethodResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
