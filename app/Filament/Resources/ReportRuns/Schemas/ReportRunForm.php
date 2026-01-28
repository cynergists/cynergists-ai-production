<?php

namespace App\Filament\Resources\ReportRuns\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class ReportRunForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('report_id')
                    ->relationship('report', 'id'),
                Select::make('partner_id')
                    ->relationship('partner', 'id')
                    ->required(),
                DateTimePicker::make('period_start')
                    ->required(),
                DateTimePicker::make('period_end')
                    ->required(),
                DateTimePicker::make('generated_at')
                    ->required(),
                TextInput::make('status')
                    ->required()
                    ->default('generated'),
                Textarea::make('pdf_url')
                    ->columnSpanFull(),
                Textarea::make('csv_commissions_url')
                    ->columnSpanFull(),
                Textarea::make('csv_payouts_url')
                    ->columnSpanFull(),
                Textarea::make('error_message')
                    ->columnSpanFull(),
            ]);
    }
}
