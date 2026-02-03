<?php

namespace App\Filament\Resources\SeoRecommendationApprovals\Pages;

use App\Filament\Resources\SeoRecommendationApprovals\SeoRecommendationApprovalResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditSeoRecommendationApproval extends EditRecord
{
    protected static string $resource = SeoRecommendationApprovalResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
