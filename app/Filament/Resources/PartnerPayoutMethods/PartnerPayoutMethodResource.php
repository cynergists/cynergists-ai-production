<?php

namespace App\Filament\Resources\PartnerPayoutMethods;

use App\Filament\Resources\PartnerPayoutMethods\Pages\CreatePartnerPayoutMethod;
use App\Filament\Resources\PartnerPayoutMethods\Pages\EditPartnerPayoutMethod;
use App\Filament\Resources\PartnerPayoutMethods\Pages\ListPartnerPayoutMethods;
use App\Filament\Resources\PartnerPayoutMethods\Schemas\PartnerPayoutMethodForm;
use App\Filament\Resources\PartnerPayoutMethods\Tables\PartnerPayoutMethodsTable;
use App\Models\PartnerPayoutMethod;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class PartnerPayoutMethodResource extends Resource
{
    protected static ?string $model = PartnerPayoutMethod::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedWallet;

    protected static string|\UnitEnum|null $navigationGroup = 'Partners';

    protected static ?int $navigationSort = 7;

    protected static ?string $navigationLabel = 'Payout Methods';

    public static function form(Schema $schema): Schema
    {
        return PartnerPayoutMethodForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return PartnerPayoutMethodsTable::configure($table);
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
            'index' => ListPartnerPayoutMethods::route('/'),
            'create' => CreatePartnerPayoutMethod::route('/create'),
            'edit' => EditPartnerPayoutMethod::route('/{record}/edit'),
        ];
    }
}
