<?php

namespace App\Filament\Resources\PartnerTicketMessages;

use App\Filament\Resources\PartnerTicketMessages\Pages\CreatePartnerTicketMessage;
use App\Filament\Resources\PartnerTicketMessages\Pages\EditPartnerTicketMessage;
use App\Filament\Resources\PartnerTicketMessages\Pages\ListPartnerTicketMessages;
use App\Filament\Resources\PartnerTicketMessages\Schemas\PartnerTicketMessageForm;
use App\Filament\Resources\PartnerTicketMessages\Tables\PartnerTicketMessagesTable;
use App\Models\PartnerTicketMessage;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class PartnerTicketMessageResource extends Resource
{
    protected static ?string $model = PartnerTicketMessage::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedChatBubbleLeft;

    protected static string|\UnitEnum|null $navigationGroup = 'Partners';

    protected static ?int $navigationSort = 10;

    protected static ?string $navigationLabel = 'Ticket Messages';

    public static function form(Schema $schema): Schema
    {
        return PartnerTicketMessageForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return PartnerTicketMessagesTable::configure($table);
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
            'index' => ListPartnerTicketMessages::route('/'),
            'create' => CreatePartnerTicketMessage::route('/create'),
            'edit' => EditPartnerTicketMessage::route('/{record}/edit'),
        ];
    }
}
