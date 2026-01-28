<?php

namespace App\Filament\Resources\PartnerPayouts\Pages;

use App\Filament\Resources\PartnerPayouts\PartnerPayoutResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListPartnerPayouts extends ListRecords
{
    protected static string $resource = PartnerPayoutResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
