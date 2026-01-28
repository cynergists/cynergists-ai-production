<?php

namespace App\Filament\Resources\ReportRuns;

use App\Filament\Resources\ReportRuns\Pages\CreateReportRun;
use App\Filament\Resources\ReportRuns\Pages\EditReportRun;
use App\Filament\Resources\ReportRuns\Pages\ListReportRuns;
use App\Filament\Resources\ReportRuns\Schemas\ReportRunForm;
use App\Filament\Resources\ReportRuns\Tables\ReportRunsTable;
use App\Models\ReportRun;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class ReportRunResource extends Resource
{
    protected static ?string $model = ReportRun::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedDocumentChartBar;

    protected static string|\UnitEnum|null $navigationGroup = 'Reports';

    protected static ?int $navigationSort = 2;

    protected static ?string $navigationLabel = 'Report Runs';

    public static function form(Schema $schema): Schema
    {
        return ReportRunForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return ReportRunsTable::configure($table);
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
            'index' => ListReportRuns::route('/'),
            'create' => CreateReportRun::route('/create'),
            'edit' => EditReportRun::route('/{record}/edit'),
        ];
    }
}
