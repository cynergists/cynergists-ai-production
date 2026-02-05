<?php

namespace App\Filament\Resources\SeoReports;

use App\Filament\Resources\SeoReports\Pages\EditSeoReport;
use App\Filament\Resources\SeoReports\Pages\ListSeoReports;
use App\Filament\Resources\SeoReports\Schemas\SeoReportForm;
use App\Filament\Resources\SeoReports\Tables\SeoReportsTable;
use App\Models\SeoReport;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class SeoReportResource extends Resource
{
    protected static ?string $model = SeoReport::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedChartBar;

    protected static string|\UnitEnum|null $navigationGroup = 'Carbon';

    protected static ?int $navigationSort = 7;

    protected static ?string $navigationLabel = 'Reports';

    public static function form(Schema $schema): Schema
    {
        return SeoReportForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return SeoReportsTable::configure($table);
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
            'index' => ListSeoReports::route('/'),
            'edit' => EditSeoReport::route('/{record}/edit'),
        ];
    }

    public static function canCreate(): bool
    {
        return false;
    }
}
