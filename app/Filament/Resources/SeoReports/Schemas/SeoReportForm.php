<?php

namespace App\Filament\Resources\SeoReports\Schemas;

use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\KeyValue;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class SeoReportForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Grid::make(2)
                    ->schema([
                        Section::make('Report Details')
                            ->schema([
                                Select::make('seo_site_id')
                                    ->label('Site')
                                    ->relationship('site', 'name')
                                    ->required()
                                    ->searchable()
                                    ->preload(),
                                DatePicker::make('period_start')
                                    ->required(),
                                DatePicker::make('period_end')
                                    ->required()
                                    ->rule('after_or_equal:period_start'),
                                Select::make('status')
                                    ->required()
                                    ->options([
                                        'ready' => 'Ready',
                                        'draft' => 'Draft',
                                        'failed' => 'Failed',
                                    ])
                                    ->default('ready'),
                                TextInput::make('report_url')
                                    ->label('Report URL')
                                    ->url()
                                    ->maxLength(255),
                            ]),
                        Section::make('Highlights')
                            ->schema([
                                KeyValue::make('highlights')
                                    ->keyLabel('Metric')
                                    ->valueLabel('Value')
                                    ->addActionLabel('Add Highlight'),
                            ]),
                    ]),
                Section::make('Metrics')
                    ->schema([
                        KeyValue::make('metrics')
                            ->keyLabel('Metric')
                            ->valueLabel('Value')
                            ->addActionLabel('Add Metric')
                            ->columnSpanFull(),
                    ]),
            ]);
    }
}
