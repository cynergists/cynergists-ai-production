<?php

namespace App\Filament\Resources\PartnerDeals;

use App\Filament\Resources\PartnerDeals\Pages\CreatePartnerDeal;
use App\Filament\Resources\PartnerDeals\Pages\EditPartnerDeal;
use App\Filament\Resources\PartnerDeals\Pages\ListPartnerDeals;
use App\Filament\Resources\PartnerDeals\Schemas\PartnerDealForm;
use App\Filament\Resources\PartnerDeals\Tables\PartnerDealsTable;
use App\Models\PartnerDeal;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class PartnerDealResource extends Resource
{
    protected static ?string $model = PartnerDeal::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedBanknotes;

    protected static string|\UnitEnum|null $navigationGroup = 'Partners';

    protected static ?int $navigationSort = 3;

    protected static ?string $navigationLabel = 'Deals';

    public static function form(Schema $schema): Schema
    {
        return PartnerDealForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return PartnerDealsTable::configure($table);
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
            'index' => ListPartnerDeals::route('/'),
            'create' => CreatePartnerDeal::route('/create'),
            'edit' => EditPartnerDeal::route('/{record}/edit'),
        ];
    }
}
