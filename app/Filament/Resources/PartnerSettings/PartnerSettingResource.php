<?php

namespace App\Filament\Resources\PartnerSettings;

use App\Filament\Resources\PartnerSettings\Pages\CreatePartnerSetting;
use App\Filament\Resources\PartnerSettings\Pages\EditPartnerSetting;
use App\Filament\Resources\PartnerSettings\Pages\ListPartnerSettings;
use App\Filament\Resources\PartnerSettings\Schemas\PartnerSettingForm;
use App\Filament\Resources\PartnerSettings\Tables\PartnerSettingsTable;
use App\Models\PartnerSetting;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class PartnerSettingResource extends Resource
{
    protected static ?string $model = PartnerSetting::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedCog6Tooth;

    protected static string|\UnitEnum|null $navigationGroup = 'Partners';

    protected static ?int $navigationSort = 13;

    protected static ?string $navigationLabel = 'Settings';

    public static function form(Schema $schema): Schema
    {
        return PartnerSettingForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return PartnerSettingsTable::configure($table);
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
            'index' => ListPartnerSettings::route('/'),
            'create' => CreatePartnerSetting::route('/create'),
            'edit' => EditPartnerSetting::route('/{record}/edit'),
        ];
    }
}
