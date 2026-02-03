<?php

namespace App\Filament\Resources\SeoChanges;

use App\Filament\Resources\SeoChanges\Pages\EditSeoChange;
use App\Filament\Resources\SeoChanges\Pages\ListSeoChanges;
use App\Filament\Resources\SeoChanges\Schemas\SeoChangeForm;
use App\Filament\Resources\SeoChanges\Tables\SeoChangesTable;
use App\Models\SeoChange;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class SeoChangeResource extends Resource
{
    protected static ?string $model = SeoChange::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedArrowPathRoundedSquare;

    protected static string|\UnitEnum|null $navigationGroup = 'SEO Engine';

    protected static ?int $navigationSort = 6;

    protected static ?string $navigationLabel = 'Changes';

    public static function form(Schema $schema): Schema
    {
        return SeoChangeForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return SeoChangesTable::configure($table);
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
            'index' => ListSeoChanges::route('/'),
            'edit' => EditSeoChange::route('/{record}/edit'),
        ];
    }

    public static function canCreate(): bool
    {
        return false;
    }
}
