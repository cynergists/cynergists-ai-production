<?php

namespace App\Filament\Resources\PartnerPayouts;

use App\Filament\Resources\PartnerPayouts\Pages\CreatePartnerPayout;
use App\Filament\Resources\PartnerPayouts\Pages\EditPartnerPayout;
use App\Filament\Resources\PartnerPayouts\Pages\ListPartnerPayouts;
use App\Filament\Resources\PartnerPayouts\Schemas\PartnerPayoutForm;
use App\Filament\Resources\PartnerPayouts\Tables\PartnerPayoutsTable;
use App\Models\PartnerPayout;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class PartnerPayoutResource extends Resource
{
    protected static ?string $model = PartnerPayout::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedArrowUpTray;

    protected static string|\UnitEnum|null $navigationGroup = 'Partners';

    protected static ?int $navigationSort = 6;

    protected static ?string $navigationLabel = 'Payouts';

    public static function form(Schema $schema): Schema
    {
        return PartnerPayoutForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return PartnerPayoutsTable::configure($table);
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
            'index' => ListPartnerPayouts::route('/'),
            'create' => CreatePartnerPayout::route('/create'),
            'edit' => EditPartnerPayout::route('/{record}/edit'),
        ];
    }
}
