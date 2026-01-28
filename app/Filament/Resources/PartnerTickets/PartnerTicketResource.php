<?php

namespace App\Filament\Resources\PartnerTickets;

use App\Filament\Resources\PartnerTickets\Pages\CreatePartnerTicket;
use App\Filament\Resources\PartnerTickets\Pages\EditPartnerTicket;
use App\Filament\Resources\PartnerTickets\Pages\ListPartnerTickets;
use App\Filament\Resources\PartnerTickets\Schemas\PartnerTicketForm;
use App\Filament\Resources\PartnerTickets\Tables\PartnerTicketsTable;
use App\Models\PartnerTicket;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class PartnerTicketResource extends Resource
{
    protected static ?string $model = PartnerTicket::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedTicket;

    protected static string|\UnitEnum|null $navigationGroup = 'Partners';

    protected static ?int $navigationSort = 9;

    protected static ?string $navigationLabel = 'Tickets';

    public static function form(Schema $schema): Schema
    {
        return PartnerTicketForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return PartnerTicketsTable::configure($table);
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
            'index' => ListPartnerTickets::route('/'),
            'create' => CreatePartnerTicket::route('/create'),
            'edit' => EditPartnerTicket::route('/{record}/edit'),
        ];
    }
}
