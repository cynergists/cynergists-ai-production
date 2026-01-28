<?php

namespace App\Filament\Resources\PortalAvailableAgents;

use App\Filament\Resources\PortalAvailableAgents\Pages\CreatePortalAvailableAgent;
use App\Filament\Resources\PortalAvailableAgents\Pages\EditPortalAvailableAgent;
use App\Filament\Resources\PortalAvailableAgents\Pages\ListPortalAvailableAgents;
use App\Filament\Resources\PortalAvailableAgents\Schemas\PortalAvailableAgentForm;
use App\Filament\Resources\PortalAvailableAgents\Tables\PortalAvailableAgentsTable;
use App\Models\PortalAvailableAgent;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class PortalAvailableAgentResource extends Resource
{
    protected static ?string $model = PortalAvailableAgent::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedCpuChip;

    protected static string|\UnitEnum|null $navigationGroup = 'Client Portal';

    protected static ?int $navigationSort = 2;

    protected static ?string $navigationLabel = 'Available Agents';

    public static function form(Schema $schema): Schema
    {
        return PortalAvailableAgentForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return PortalAvailableAgentsTable::configure($table);
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
            'index' => ListPortalAvailableAgents::route('/'),
            'create' => CreatePortalAvailableAgent::route('/create'),
            'edit' => EditPortalAvailableAgent::route('/{record}/edit'),
        ];
    }
}
