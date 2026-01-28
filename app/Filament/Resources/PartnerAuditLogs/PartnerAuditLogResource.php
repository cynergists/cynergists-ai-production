<?php

namespace App\Filament\Resources\PartnerAuditLogs;

use App\Filament\Resources\PartnerAuditLogs\Pages\CreatePartnerAuditLog;
use App\Filament\Resources\PartnerAuditLogs\Pages\EditPartnerAuditLog;
use App\Filament\Resources\PartnerAuditLogs\Pages\ListPartnerAuditLogs;
use App\Filament\Resources\PartnerAuditLogs\Schemas\PartnerAuditLogForm;
use App\Filament\Resources\PartnerAuditLogs\Tables\PartnerAuditLogsTable;
use App\Models\PartnerAuditLog;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class PartnerAuditLogResource extends Resource
{
    protected static ?string $model = PartnerAuditLog::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedClipboardDocumentList;

    protected static string|\UnitEnum|null $navigationGroup = 'Partners';

    protected static ?int $navigationSort = 11;

    protected static ?string $navigationLabel = 'Audit Logs';

    public static function form(Schema $schema): Schema
    {
        return PartnerAuditLogForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return PartnerAuditLogsTable::configure($table);
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
            'index' => ListPartnerAuditLogs::route('/'),
            'create' => CreatePartnerAuditLog::route('/create'),
            'edit' => EditPartnerAuditLog::route('/{record}/edit'),
        ];
    }
}
