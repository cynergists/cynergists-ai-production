<?php

namespace App\Filament\Resources\PartnerCommissions\Pages;

use App\Filament\Resources\PartnerCommissions\PartnerCommissionResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListPartnerCommissions extends ListRecords
{
    protected static string $resource = PartnerCommissionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
