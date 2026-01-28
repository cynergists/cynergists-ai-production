<?php

namespace App\Filament\Resources\PortalTenants;

use App\Filament\Resources\PortalTenants\Pages\CreatePortalTenant;
use App\Filament\Resources\PortalTenants\Pages\EditPortalTenant;
use App\Filament\Resources\PortalTenants\Pages\ListPortalTenants;
use App\Filament\Resources\PortalTenants\Schemas\PortalTenantForm;
use App\Filament\Resources\PortalTenants\Tables\PortalTenantsTable;
use App\Models\PortalTenant;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class PortalTenantResource extends Resource
{
    protected static ?string $model = PortalTenant::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedBuildingOffice;

    protected static string|\UnitEnum|null $navigationGroup = 'Client Portal';

    protected static ?int $navigationSort = 1;

    protected static ?string $navigationLabel = 'Tenants';

    public static function form(Schema $schema): Schema
    {
        return PortalTenantForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return PortalTenantsTable::configure($table);
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
            'index' => ListPortalTenants::route('/'),
            'create' => CreatePortalTenant::route('/create'),
            'edit' => EditPortalTenant::route('/{record}/edit'),
        ];
    }
}
