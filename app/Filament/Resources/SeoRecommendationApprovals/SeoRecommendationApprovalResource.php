<?php

namespace App\Filament\Resources\SeoRecommendationApprovals;

use App\Filament\Resources\SeoRecommendationApprovals\Pages\EditSeoRecommendationApproval;
use App\Filament\Resources\SeoRecommendationApprovals\Pages\ListSeoRecommendationApprovals;
use App\Filament\Resources\SeoRecommendationApprovals\Schemas\SeoRecommendationApprovalForm;
use App\Filament\Resources\SeoRecommendationApprovals\Tables\SeoRecommendationApprovalsTable;
use App\Models\SeoRecommendationApproval;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class SeoRecommendationApprovalResource extends Resource
{
    protected static ?string $model = SeoRecommendationApproval::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedCheckBadge;

    protected static string|\UnitEnum|null $navigationGroup = 'SEO Engine';

    protected static ?int $navigationSort = 5;

    protected static ?string $navigationLabel = 'Approvals';

    public static function form(Schema $schema): Schema
    {
        return SeoRecommendationApprovalForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return SeoRecommendationApprovalsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListSeoRecommendationApprovals::route('/'),
            'edit' => EditSeoRecommendationApproval::route('/{record}/edit'),
        ];
    }

    public static function canCreate(): bool
    {
        return false;
    }
}
