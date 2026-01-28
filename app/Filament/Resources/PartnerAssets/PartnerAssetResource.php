<?php

namespace App\Filament\Resources\PartnerAssets;

use App\Filament\Resources\PartnerAssets\Pages\CreatePartnerAsset;
use App\Filament\Resources\PartnerAssets\Pages\EditPartnerAsset;
use App\Filament\Resources\PartnerAssets\Pages\ListPartnerAssets;
use App\Filament\Resources\PartnerAssets\Schemas\PartnerAssetForm;
use App\Filament\Resources\PartnerAssets\Tables\PartnerAssetsTable;
use App\Models\PartnerAsset;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class PartnerAssetResource extends Resource
{
    protected static ?string $model = PartnerAsset::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedPhoto;

    protected static string|\UnitEnum|null $navigationGroup = 'Partners';

    protected static ?int $navigationSort = 8;

    protected static ?string $navigationLabel = 'Assets';

    public static function form(Schema $schema): Schema
    {
        return PartnerAssetForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return PartnerAssetsTable::configure($table);
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
            'index' => ListPartnerAssets::route('/'),
            'create' => CreatePartnerAsset::route('/create'),
            'edit' => EditPartnerAsset::route('/{record}/edit'),
        ];
    }
}
