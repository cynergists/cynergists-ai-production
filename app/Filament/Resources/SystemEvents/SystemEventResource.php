<?php

namespace App\Filament\Resources\SystemEvents;

use App\Filament\Resources\SystemEvents\Pages\CreateSystemEvent;
use App\Filament\Resources\SystemEvents\Pages\EditSystemEvent;
use App\Filament\Resources\SystemEvents\Pages\ListSystemEvents;
use App\Filament\Resources\SystemEvents\RelationManagers\EmailTemplatesRelationManager;
use App\Filament\Resources\SystemEvents\Schemas\SystemEventForm;
use App\Filament\Resources\SystemEvents\Tables\SystemEventsTable;
use App\Models\SystemEvent;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class SystemEventResource extends Resource
{
    protected static ?string $model = SystemEvent::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedBell;

    protected static string|\UnitEnum|null $navigationGroup = 'System';

    protected static ?int $navigationSort = 1;

    protected static ?string $navigationLabel = 'Events & Emails';

    public static function form(Schema $schema): Schema
    {
        return SystemEventForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return SystemEventsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            EmailTemplatesRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListSystemEvents::route('/'),
            'create' => CreateSystemEvent::route('/create'),
            'edit' => EditSystemEvent::route('/{record}/edit'),
        ];
    }
}
