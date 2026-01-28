<?php

namespace App\Filament\Resources\PartnerAssets\Pages;

use App\Filament\Resources\PartnerAssets\PartnerAssetResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditPartnerAsset extends EditRecord
{
    protected static string $resource = PartnerAssetResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
