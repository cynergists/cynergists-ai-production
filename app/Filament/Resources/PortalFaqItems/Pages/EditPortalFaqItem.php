<?php

namespace App\Filament\Resources\PortalFaqItems\Pages;

use App\Filament\Resources\PortalFaqItems\PortalFaqItemResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditPortalFaqItem extends EditRecord
{
    protected static string $resource = PortalFaqItemResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
