<?php

namespace App\Filament\Resources\SeoChanges\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\KeyValue;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class SeoChangeForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Grid::make(2)
                    ->schema([
                        Section::make('Change Details')
                            ->schema([
                                Select::make('seo_site_id')
                                    ->label('Site')
                                    ->relationship('site', 'name')
                                    ->required()
                                    ->searchable()
                                    ->preload(),
                                Select::make('seo_recommendation_id')
                                    ->label('Recommendation')
                                    ->relationship('recommendation', 'title')
                                    ->searchable()
                                    ->preload(),
                                Select::make('status')
                                    ->required()
                                    ->options([
                                        'applied' => 'Applied',
                                        'failed' => 'Failed',
                                    ])
                                    ->default('applied'),
                                DateTimePicker::make('applied_at'),
                            ]),
                        Section::make('Summary')
                            ->schema([
                                Textarea::make('summary')
                                    ->rows(4)
                                    ->placeholder('Summary of the change...'),
                            ]),
                    ]),
                Section::make('Diff & Metadata')
                    ->schema([
                        KeyValue::make('diff')
                            ->keyLabel('Field')
                            ->valueLabel('Change')
                            ->addActionLabel('Add Diff'),
                        KeyValue::make('metadata')
                            ->keyLabel('Key')
                            ->valueLabel('Value')
                            ->addActionLabel('Add Metadata'),
                    ]),
            ]);
    }
}
