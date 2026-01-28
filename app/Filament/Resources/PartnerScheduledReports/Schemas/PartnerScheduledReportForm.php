<?php

namespace App\Filament\Resources\PartnerScheduledReports\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class PartnerScheduledReportForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('partner_id')
                    ->relationship('partner', 'id')
                    ->required(),
                TextInput::make('cadence')
                    ->required()
                    ->default('monthly'),
                TextInput::make('recipients'),
                Toggle::make('is_active')
                    ->required(),
                DateTimePicker::make('last_sent_at'),
                DateTimePicker::make('next_send_at'),
                TextInput::make('report_type')
                    ->required()
                    ->default('combined'),
                Toggle::make('format_pdf')
                    ->required(),
                Toggle::make('format_csv')
                    ->required(),
                TextInput::make('day_of_week')
                    ->numeric(),
                TextInput::make('day_of_month')
                    ->numeric(),
                TextInput::make('timezone')
                    ->required()
                    ->default('America/Denver'),
                TextInput::make('include_statuses'),
                TextInput::make('detail_level')
                    ->required()
                    ->default('detailed'),
                TextInput::make('email_to')
                    ->email(),
            ]);
    }
}
