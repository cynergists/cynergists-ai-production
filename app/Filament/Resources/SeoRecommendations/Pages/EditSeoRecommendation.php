<?php

namespace App\Filament\Resources\SeoRecommendations\Pages;

use App\Filament\Resources\SeoRecommendations\SeoRecommendationResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditSeoRecommendation extends EditRecord
{
    protected static string $resource = SeoRecommendationResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
