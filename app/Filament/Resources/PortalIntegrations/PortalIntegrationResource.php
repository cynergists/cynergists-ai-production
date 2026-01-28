<?php

namespace App\Filament\Resources\PortalIntegrations;

use App\Filament\Resources\PortalIntegrations\Pages\CreatePortalIntegration;
use App\Filament\Resources\PortalIntegrations\Pages\EditPortalIntegration;
use App\Filament\Resources\PortalIntegrations\Pages\ListPortalIntegrations;
use App\Filament\Resources\PortalIntegrations\Schemas\PortalIntegrationForm;
use App\Filament\Resources\PortalIntegrations\Tables\PortalIntegrationsTable;
use App\Models\PortalIntegration;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class PortalIntegrationResource extends Resource
{
    protected static ?string $model = PortalIntegration::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedPuzzlePiece;

    protected static string|\UnitEnum|null $navigationGroup = 'Client Portal';

    protected static ?int $navigationSort = 4;

    protected static ?string $navigationLabel = 'Integrations';

    public static function form(Schema $schema): Schema
    {
        return PortalIntegrationForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return PortalIntegrationsTable::configure($table);
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
            'index' => ListPortalIntegrations::route('/'),
            'create' => CreatePortalIntegration::route('/create'),
            'edit' => EditPortalIntegration::route('/{record}/edit'),
        ];
    }
}
