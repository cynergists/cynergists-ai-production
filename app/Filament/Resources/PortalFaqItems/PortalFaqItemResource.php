<?php

namespace App\Filament\Resources\PortalFaqItems;

use App\Filament\Resources\PortalFaqItems\Pages\CreatePortalFaqItem;
use App\Filament\Resources\PortalFaqItems\Pages\EditPortalFaqItem;
use App\Filament\Resources\PortalFaqItems\Pages\ListPortalFaqItems;
use App\Filament\Resources\PortalFaqItems\Schemas\PortalFaqItemForm;
use App\Filament\Resources\PortalFaqItems\Tables\PortalFaqItemsTable;
use App\Models\PortalFaqItem;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class PortalFaqItemResource extends Resource
{
    protected static ?string $model = PortalFaqItem::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedQuestionMarkCircle;

    protected static string|\UnitEnum|null $navigationGroup = 'Client Portal';

    protected static ?int $navigationSort = 3;

    protected static ?string $navigationLabel = 'FAQs';

    public static function form(Schema $schema): Schema
    {
        return PortalFaqItemForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return PortalFaqItemsTable::configure($table);
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
            'index' => ListPortalFaqItems::route('/'),
            'create' => CreatePortalFaqItem::route('/create'),
            'edit' => EditPortalFaqItem::route('/{record}/edit'),
        ];
    }
}
