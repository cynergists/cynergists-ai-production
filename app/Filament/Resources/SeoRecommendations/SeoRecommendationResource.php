<?php

namespace App\Filament\Resources\SeoRecommendations;

use App\Filament\Resources\SeoRecommendations\Pages\CreateSeoRecommendation;
use App\Filament\Resources\SeoRecommendations\Pages\EditSeoRecommendation;
use App\Filament\Resources\SeoRecommendations\Pages\ListSeoRecommendations;
use App\Filament\Resources\SeoRecommendations\Schemas\SeoRecommendationForm;
use App\Filament\Resources\SeoRecommendations\Tables\SeoRecommendationsTable;
use App\Models\SeoRecommendation;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class SeoRecommendationResource extends Resource
{
    protected static ?string $model = SeoRecommendation::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedClipboardDocumentList;

    protected static string|\UnitEnum|null $navigationGroup = 'SEO Engine';

    protected static ?int $navigationSort = 2;

    protected static ?string $navigationLabel = 'Recommendations';

    public static function form(Schema $schema): Schema
    {
        return SeoRecommendationForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return SeoRecommendationsTable::configure($table);
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
            'index' => ListSeoRecommendations::route('/'),
            'create' => CreateSeoRecommendation::route('/create'),
            'edit' => EditSeoRecommendation::route('/{record}/edit'),
        ];
    }

    public static function getNavigationBadge(): ?string
    {
        $count = static::getModel()::query()
            ->where('status', 'pending')
            ->count();

        return $count > 0 ? (string) $count : null;
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return static::getModel()::query()
            ->where('status', 'pending')
            ->exists() ? 'warning' : null;
    }
}
