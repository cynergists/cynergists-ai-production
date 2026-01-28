<?php

namespace App\Filament\Resources\PartnerDeals\Pages;

use App\Filament\Resources\PartnerDeals\PartnerDealResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditPartnerDeal extends EditRecord
{
    protected static string $resource = PartnerDealResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
