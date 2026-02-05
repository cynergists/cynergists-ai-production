<?php

namespace App\Filament\Resources\SeoSites;

use App\Filament\Resources\SeoSites\Pages\CreateSeoSite;
use App\Filament\Resources\SeoSites\Pages\EditSeoSite;
use App\Filament\Resources\SeoSites\Pages\ListSeoSites;
use App\Filament\Resources\SeoSites\Schemas\SeoSiteForm;
use App\Filament\Resources\SeoSites\Tables\SeoSitesTable;
use App\Models\SeoSite;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class SeoSiteResource extends Resource
{
    protected static ?string $model = SeoSite::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedGlobeAlt;

    protected static string|\UnitEnum|null $navigationGroup = 'Carbon';

    protected static ?int $navigationSort = 1;

    protected static ?string $navigationLabel = 'Sites';

    public static function form(Schema $schema): Schema
    {
        return SeoSiteForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return SeoSitesTable::configure($table);
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
            'index' => ListSeoSites::route('/'),
            'create' => CreateSeoSite::route('/create'),
            'edit' => EditSeoSite::route('/{record}/edit'),
        ];
    }
}
