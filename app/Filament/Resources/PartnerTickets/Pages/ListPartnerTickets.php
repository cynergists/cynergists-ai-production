<?php

namespace App\Filament\Resources\PartnerTickets\Pages;

use App\Filament\Resources\PartnerTickets\PartnerTicketResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListPartnerTickets extends ListRecords
{
    protected static string $resource = PartnerTicketResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
