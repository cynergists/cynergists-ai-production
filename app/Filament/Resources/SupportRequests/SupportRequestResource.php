<?php

namespace App\Filament\Resources\SupportRequests;

use App\Filament\Resources\SupportRequests\Pages\EditSupportRequest;
use App\Filament\Resources\SupportRequests\Pages\ListSupportRequests;
use App\Filament\Resources\SupportRequests\Pages\ViewSupportRequest;
use App\Filament\Resources\SupportRequests\Schemas\SupportRequestForm;
use App\Filament\Resources\SupportRequests\Tables\SupportRequestsTable;
use App\Models\SupportRequest;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class SupportRequestResource extends Resource
{
    protected static ?string $model = SupportRequest::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedLifebuoy;

    protected static ?string $navigationLabel = 'Support Requests';

    protected static ?string $modelLabel = 'Support Request';

    protected static ?string $pluralModelLabel = 'Support Requests';

    protected static ?int $navigationSort = 10;

    public static function form(Schema $schema): Schema
    {
        return SupportRequestForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return SupportRequestsTable::configure($table);
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
            'index' => ListSupportRequests::route('/'),
            'view' => ViewSupportRequest::route('/{record}'),
            'edit' => EditSupportRequest::route('/{record}/edit'),
        ];
    }

    public static function canCreate(): bool
    {
        return false;
    }

    public static function getNavigationBadge(): ?string
    {
        return (string) static::getModel()::where('status', 'open')->count();
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return static::getModel()::where('status', 'open')->count() > 0 ? 'danger' : null;
    }
}
