<?php

namespace App\Filament\Resources\SeoAudits\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\KeyValue;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class SeoAuditForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Grid::make(2)
                    ->schema([
                        Section::make('Audit Details')
                            ->schema([
                                Select::make('seo_site_id')
                                    ->label('Site')
                                    ->relationship('site', 'name')
                                    ->required()
                                    ->searchable()
                                    ->preload(),
                                Select::make('status')
                                    ->required()
                                    ->options([
                                        'pending' => 'Pending',
                                        'running' => 'Running',
                                        'completed' => 'Completed',
                                        'failed' => 'Failed',
                                    ])
                                    ->default('pending'),
                                Select::make('trigger')
                                    ->required()
                                    ->options([
                                        'scheduled' => 'Scheduled',
                                        'manual' => 'Manual',
                                        'integration' => 'Integration',
                                    ])
                                    ->default('scheduled'),
                                TextInput::make('issues_count')
                                    ->label('Issues Found')
                                    ->numeric()
                                    ->default(0),
                            ]),
                        Section::make('Timing')
                            ->schema([
                                DateTimePicker::make('started_at'),
                                DateTimePicker::make('completed_at'),
                            ]),
                    ]),
                Section::make('Summary')
                    ->schema([
                        Textarea::make('summary')
                            ->rows(4)
                            ->placeholder('High-level summary of audit findings...'),
                        KeyValue::make('metrics')
                            ->keyLabel('Metric')
                            ->valueLabel('Value')
                            ->addActionLabel('Add Metric'),
                    ]),
            ]);
    }
}
