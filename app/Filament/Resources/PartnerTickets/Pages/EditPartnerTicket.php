<?php

namespace App\Filament\Resources\PartnerTickets\Pages;

use App\Filament\Resources\PartnerTickets\PartnerTicketResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditPartnerTicket extends EditRecord
{
    protected static string $resource = PartnerTicketResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
