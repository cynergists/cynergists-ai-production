<?php

namespace App\Filament\Resources\SeoAudits;

use App\Filament\Resources\SeoAudits\Pages\CreateSeoAudit;
use App\Filament\Resources\SeoAudits\Pages\EditSeoAudit;
use App\Filament\Resources\SeoAudits\Pages\ListSeoAudits;
use App\Filament\Resources\SeoAudits\Schemas\SeoAuditForm;
use App\Filament\Resources\SeoAudits\Tables\SeoAuditsTable;
use App\Models\SeoAudit;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class SeoAuditResource extends Resource
{
    protected static ?string $model = SeoAudit::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedDocumentMagnifyingGlass;

    protected static string|\UnitEnum|null $navigationGroup = 'Carbon';

    protected static ?int $navigationSort = 3;

    protected static ?string $navigationLabel = 'Audits';

    public static function form(Schema $schema): Schema
    {
        return SeoAuditForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return SeoAuditsTable::configure($table);
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
            'index' => ListSeoAudits::route('/'),
            'create' => CreateSeoAudit::route('/create'),
            'edit' => EditSeoAudit::route('/{record}/edit'),
        ];
    }
}
