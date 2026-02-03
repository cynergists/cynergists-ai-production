<?php

namespace App\Filament\Resources\SeoChanges\Pages;

use App\Filament\Resources\SeoChanges\SeoChangeResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditSeoChange extends EditRecord
{
    protected static string $resource = SeoChangeResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
