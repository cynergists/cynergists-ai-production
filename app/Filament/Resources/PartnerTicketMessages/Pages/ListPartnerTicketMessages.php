<?php

namespace App\Filament\Resources\PartnerTicketMessages\Pages;

use App\Filament\Resources\PartnerTicketMessages\PartnerTicketMessageResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListPartnerTicketMessages extends ListRecords
{
    protected static string $resource = PartnerTicketMessageResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
