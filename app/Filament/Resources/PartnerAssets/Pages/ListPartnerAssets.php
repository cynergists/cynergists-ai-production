<?php

namespace App\Filament\Resources\PartnerAssets\Pages;

use App\Filament\Resources\PartnerAssets\PartnerAssetResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListPartnerAssets extends ListRecords
{
    protected static string $resource = PartnerAssetResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
