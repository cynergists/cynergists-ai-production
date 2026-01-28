<?php

namespace App\Filament\Resources\PartnerTicketMessages\Pages;

use App\Filament\Resources\PartnerTicketMessages\PartnerTicketMessageResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditPartnerTicketMessage extends EditRecord
{
    protected static string $resource = PartnerTicketMessageResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
