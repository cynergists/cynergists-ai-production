<?php

namespace App\Filament\Resources\PartnerSettings\Pages;

use App\Filament\Resources\PartnerSettings\PartnerSettingResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListPartnerSettings extends ListRecords
{
    protected static string $resource = PartnerSettingResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
