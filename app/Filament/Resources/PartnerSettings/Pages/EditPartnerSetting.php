<?php

namespace App\Filament\Resources\PartnerSettings\Pages;

use App\Filament\Resources\PartnerSettings\PartnerSettingResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditPartnerSetting extends EditRecord
{
    protected static string $resource = PartnerSettingResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
