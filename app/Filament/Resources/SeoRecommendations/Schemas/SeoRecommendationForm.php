<?php

namespace App\Filament\Resources\SeoRecommendations\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\KeyValue;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TagsInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Tabs;
use Filament\Schemas\Components\Tabs\Tab;
use Filament\Schemas\Schema;

class SeoRecommendationForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Tabs::make('Recommendation')
                    ->tabs([
                        Tab::make('Details')
                            ->icon('heroicon-o-clipboard-document-list')
                            ->schema([
                                Grid::make(2)
                                    ->schema([
                                        Section::make('Core')
                                            ->schema([
                                                Select::make('seo_site_id')
                                                    ->label('Site')
                                                    ->relationship('site', 'name')
                                                    ->required()
                                                    ->searchable()
                                                    ->preload(),
                                                Select::make('seo_audit_id')
                                                    ->label('Audit')
                                                    ->relationship('audit', 'id')
                                                    ->searchable()
                                                    ->preload(),
                                                Select::make('type')
                                                    ->required()
                                                    ->options([
                                                        'technical' => 'Technical',
                                                        'on_page' => 'On-Page',
                                                        'local' => 'Local',
                                                        'schema' => 'Schema',
                                                        'aeo' => 'AEO',
                                                    ])
                                                    ->default('technical'),
                                                TextInput::make('title')
                                                    ->required()
                                                    ->maxLength(255),
                                                Textarea::make('description')
                                                    ->rows(4)
                                                    ->columnSpanFull(),
                                            ]),
                                        Section::make('Impact')
                                            ->schema([
                                                TextInput::make('impact_score')
                                                    ->numeric()
                                                    ->default(0)
                                                    ->minValue(0)
                                                    ->maxValue(100)
                                                    ->helperText('0-100 estimated impact'),
                                                Select::make('effort')
                                                    ->required()
                                                    ->options([
                                                        'low' => 'Low',
                                                        'medium' => 'Medium',
                                                        'high' => 'High',
                                                    ])
                                                    ->default('medium'),
                                                Select::make('status')
                                                    ->required()
                                                    ->options([
                                                        'pending' => 'Pending',
                                                        'approved' => 'Approved',
                                                        'rejected' => 'Rejected',
                                                        'applied' => 'Applied',
                                                        'failed' => 'Failed',
                                                    ])
                                                    ->default('pending'),
                                                DateTimePicker::make('approved_at'),
                                                DateTimePicker::make('applied_at'),
                                            ]),
                                    ]),
                            ]),
                        Tab::make('Targets')
                            ->icon('heroicon-o-link')
                            ->schema([
                                Section::make('Target Pages')
                                    ->schema([
                                        TagsInput::make('target_pages')
                                            ->placeholder('https://example.com/page')
                                            ->helperText('Press Enter to add each page')
                                            ->columnSpanFull(),
                                    ]),
                            ]),
                        Tab::make('Metadata')
                            ->icon('heroicon-o-cog-6-tooth')
                            ->schema([
                                Section::make('Additional Data')
                                    ->schema([
                                        KeyValue::make('metadata')
                                            ->keyLabel('Key')
                                            ->valueLabel('Value')
                                            ->addActionLabel('Add Metadata')
                                            ->columnSpanFull(),
                                    ]),
                            ]),
                    ])
                    ->persistTabInQueryString()
                    ->columnSpanFull(),
            ]);
    }
}
