<?php

namespace App\Filament\Resources\PartnerDeals\Pages;

use App\Filament\Resources\PartnerDeals\PartnerDealResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListPartnerDeals extends ListRecords
{
    protected static string $resource = PartnerDealResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
