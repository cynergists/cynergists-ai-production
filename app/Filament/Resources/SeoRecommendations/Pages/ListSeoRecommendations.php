<?php

namespace App\Filament\Resources\SeoRecommendations\Pages;

use App\Filament\Resources\SeoRecommendations\SeoRecommendationResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListSeoRecommendations extends ListRecords
{
    protected static string $resource = SeoRecommendationResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
