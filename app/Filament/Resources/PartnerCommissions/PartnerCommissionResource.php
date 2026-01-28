<?php

namespace App\Filament\Resources\PartnerCommissions;

use App\Filament\Resources\PartnerCommissions\Pages\CreatePartnerCommission;
use App\Filament\Resources\PartnerCommissions\Pages\EditPartnerCommission;
use App\Filament\Resources\PartnerCommissions\Pages\ListPartnerCommissions;
use App\Filament\Resources\PartnerCommissions\Schemas\PartnerCommissionForm;
use App\Filament\Resources\PartnerCommissions\Tables\PartnerCommissionsTable;
use App\Models\PartnerCommission;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class PartnerCommissionResource extends Resource
{
    protected static ?string $model = PartnerCommission::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedReceiptPercent;

    protected static string|\UnitEnum|null $navigationGroup = 'Partners';

    protected static ?int $navigationSort = 4;

    protected static ?string $navigationLabel = 'Commissions';

    public static function form(Schema $schema): Schema
    {
        return PartnerCommissionForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return PartnerCommissionsTable::configure($table);
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
            'index' => ListPartnerCommissions::route('/'),
            'create' => CreatePartnerCommission::route('/create'),
            'edit' => EditPartnerCommission::route('/{record}/edit'),
        ];
    }
}
