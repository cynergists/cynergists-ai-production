<?php

namespace App\Filament\Resources\Cynergists;

use App\Filament\Resources\Cynergists\Pages\CreateCynergist;
use App\Filament\Resources\Cynergists\Pages\EditCynergist;
use App\Filament\Resources\Cynergists\Pages\ListCynergists;
use App\Filament\Resources\Cynergists\Schemas\CynergistForm;
use App\Filament\Resources\Cynergists\Tables\CynergistsTable;
use App\Models\Cynergist;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class CynergistResource extends Resource
{
    protected static ?string $model = Cynergist::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    public static function form(Schema $schema): Schema
    {
        return CynergistForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return CynergistsTable::configure($table);
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
            'index' => ListCynergists::route('/'),
            'create' => CreateCynergist::route('/create'),
            'edit' => EditCynergist::route('/{record}/edit'),
        ];
    }
}
