<?php

namespace App\Filament\Resources\PartnerScheduledReports;

use App\Filament\Resources\PartnerScheduledReports\Pages\CreatePartnerScheduledReport;
use App\Filament\Resources\PartnerScheduledReports\Pages\EditPartnerScheduledReport;
use App\Filament\Resources\PartnerScheduledReports\Pages\ListPartnerScheduledReports;
use App\Filament\Resources\PartnerScheduledReports\Schemas\PartnerScheduledReportForm;
use App\Filament\Resources\PartnerScheduledReports\Tables\PartnerScheduledReportsTable;
use App\Models\PartnerScheduledReport;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class PartnerScheduledReportResource extends Resource
{
    protected static ?string $model = PartnerScheduledReport::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedCalendarDays;

    protected static string|\UnitEnum|null $navigationGroup = 'Partners';

    protected static ?int $navigationSort = 12;

    protected static ?string $navigationLabel = 'Scheduled Reports';

    public static function form(Schema $schema): Schema
    {
        return PartnerScheduledReportForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return PartnerScheduledReportsTable::configure($table);
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
            'index' => ListPartnerScheduledReports::route('/'),
            'create' => CreatePartnerScheduledReport::route('/create'),
            'edit' => EditPartnerScheduledReport::route('/{record}/edit'),
        ];
    }
}
