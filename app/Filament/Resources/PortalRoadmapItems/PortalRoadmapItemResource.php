<?php

namespace App\Filament\Resources\PortalRoadmapItems;

use App\Filament\Resources\PortalRoadmapItems\Pages\CreatePortalRoadmapItem;
use App\Filament\Resources\PortalRoadmapItems\Pages\EditPortalRoadmapItem;
use App\Filament\Resources\PortalRoadmapItems\Pages\ListPortalRoadmapItems;
use App\Filament\Resources\PortalRoadmapItems\Schemas\PortalRoadmapItemForm;
use App\Filament\Resources\PortalRoadmapItems\Tables\PortalRoadmapItemsTable;
use App\Models\PortalRoadmapItem;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class PortalRoadmapItemResource extends Resource
{
    protected static ?string $model = PortalRoadmapItem::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedMap;

    protected static string|\UnitEnum|null $navigationGroup = 'Client Portal';

    protected static ?int $navigationSort = 5;

    protected static ?string $navigationLabel = 'Roadmap';

    public static function form(Schema $schema): Schema
    {
        return PortalRoadmapItemForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return PortalRoadmapItemsTable::configure($table);
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
            'index' => ListPortalRoadmapItems::route('/'),
            'create' => CreatePortalRoadmapItem::route('/create'),
            'edit' => EditPortalRoadmapItem::route('/{record}/edit'),
        ];
    }
}
