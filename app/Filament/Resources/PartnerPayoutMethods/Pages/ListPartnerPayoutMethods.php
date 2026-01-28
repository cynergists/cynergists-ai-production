<?php

namespace App\Filament\Resources\PartnerPayoutMethods\Pages;

use App\Filament\Resources\PartnerPayoutMethods\PartnerPayoutMethodResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListPartnerPayoutMethods extends ListRecords
{
    protected static string $resource = PartnerPayoutMethodResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
