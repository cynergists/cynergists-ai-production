<?php

namespace App\Filament\Resources\SeoSites\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\KeyValue;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Tabs;
use Filament\Schemas\Components\Tabs\Tab;
use Filament\Schemas\Schema;

class SeoSiteForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Tabs::make('Site')
                    ->tabs([
                        Tab::make('Overview')
                            ->icon('heroicon-o-globe-alt')
                            ->schema([
                                Grid::make(2)
                                    ->schema([
                                        Section::make('Site Details')
                                            ->schema([
                                                TextInput::make('name')
                                                    ->required()
                                                    ->maxLength(255),
                                                TextInput::make('url')
                                                    ->required()
                                                    ->url()
                                                    ->maxLength(255)
                                                    ->placeholder('https://example.com'),
                                                Select::make('status')
                                                    ->required()
                                                    ->options([
                                                        'active' => 'Active',
                                                        'paused' => 'Paused',
                                                        'archived' => 'Archived',
                                                    ])
                                                    ->default('active'),
                                            ]),
                                        Section::make('Ownership')
                                            ->schema([
                                                Select::make('tenant_id')
                                                    ->label('Tenant')
                                                    ->relationship('tenant', 'company_name')
                                                    ->searchable()
                                                    ->preload(),
                                                Select::make('user_id')
                                                    ->label('Owner')
                                                    ->relationship('owner', 'name')
                                                    ->searchable()
                                                    ->preload(),
                                                DateTimePicker::make('last_audit_at')
                                                    ->label('Last Audit')
                                                    ->helperText('Most recent audit timestamp.'),
                                            ]),
                                    ]),
                            ]),
                        Tab::make('Settings')
                            ->icon('heroicon-o-cog-6-tooth')
                            ->schema([
                                Section::make('Site Settings')
                                    ->description('Store configurable SEO settings for this site.')
                                    ->schema([
                                        KeyValue::make('settings')
                                            ->keyLabel('Setting')
                                            ->valueLabel('Value')
                                            ->addActionLabel('Add Setting')
                                            ->columnSpanFull(),
                                    ]),
                            ]),
                    ])
                    ->persistTabInQueryString()
                    ->columnSpanFull(),
            ]);
    }
}
