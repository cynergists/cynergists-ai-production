<?php

namespace App\Filament\Resources\StaffHours;

use App\Filament\Resources\StaffHours\Pages\CreateStaffHour;
use App\Filament\Resources\StaffHours\Pages\EditStaffHour;
use App\Filament\Resources\StaffHours\Pages\ListStaffHours;
use App\Filament\Resources\StaffHours\Schemas\StaffHourForm;
use App\Filament\Resources\StaffHours\Tables\StaffHoursTable;
use App\Models\StaffHour;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class StaffHourResource extends Resource
{
    protected static ?string $model = StaffHour::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedClock;

    protected static string|\UnitEnum|null $navigationGroup = 'Staff';

    protected static ?int $navigationSort = 2;

    protected static ?string $navigationLabel = 'Time Tracking';

    public static function form(Schema $schema): Schema
    {
        return StaffHourForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return StaffHoursTable::configure($table);
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
            'index' => ListStaffHours::route('/'),
            'create' => CreateStaffHour::route('/create'),
            'edit' => EditStaffHour::route('/{record}/edit'),
        ];
    }
}
