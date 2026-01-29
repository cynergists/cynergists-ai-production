<?php

namespace App\Filament\Resources\AgentApiKeys\Schemas;

use App\Models\PortalAvailableAgent;
use Filament\Forms\Components\CheckboxList;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\KeyValue;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Tabs;
use Filament\Schemas\Components\Tabs\Tab;
use Filament\Schemas\Schema;

class AgentApiKeyForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Tabs::make('API Key')
                    ->tabs([
                        Tab::make('Key Details')
                            ->icon('heroicon-o-key')
                            ->schema([
                                Grid::make(2)
                                    ->schema([
                                        Section::make('Identity')
                                            ->schema([
                                                TextInput::make('name')
                                                    ->required()
                                                    ->maxLength(255)
                                                    ->placeholder('e.g., Unipile Production')
                                                    ->helperText('A human-readable name to identify this key'),
                                                Select::make('provider')
                                                    ->required()
                                                    ->options([
                                                        'openai' => 'OpenAI',
                                                        'unipile' => 'Unipile (LinkedIn)',
                                                        'apify' => 'Apify (Lead Generation)',
                                                        'elevenlabs' => 'ElevenLabs (Voice)',
                                                        'resend' => 'Resend (Email)',
                                                    ])
                                                    ->searchable()
                                                    ->helperText('The service provider this key is for'),
                                            ]),
                                        Section::make('Status')
                                            ->schema([
                                                Toggle::make('is_active')
                                                    ->default(true)
                                                    ->helperText('Enable or disable this API key'),
                                                DateTimePicker::make('expires_at')
                                                    ->nullable()
                                                    ->helperText('Optional: When should this key expire?'),
                                            ]),
                                    ]),
                                Section::make('API Key')
                                    ->description('The actual API key or secret. This will be stored encrypted.')
                                    ->schema([
                                        Textarea::make('key')
                                            ->required()
                                            ->rows(2)
                                            ->placeholder('sk-...')
                                            ->helperText('Enter the API key or secret token')
                                            ->columnSpanFull(),
                                    ]),
                            ]),

                        Tab::make('Metadata')
                            ->icon('heroicon-o-cog-6-tooth')
                            ->schema([
                                Section::make('Additional Configuration')
                                    ->description('Provider-specific configuration options stored as key-value pairs.')
                                    ->schema([
                                        KeyValue::make('metadata')
                                            ->keyLabel('Setting')
                                            ->valueLabel('Value')
                                            ->addActionLabel('Add Setting')
                                            ->helperText('Common settings: domain (for Unipile), model (for OpenAI), voice_id (for ElevenLabs)')
                                            ->columnSpanFull(),
                                    ]),
                            ]),

                        Tab::make('Agents')
                            ->icon('heroicon-o-cpu-chip')
                            ->schema([
                                Section::make('Assigned Agents')
                                    ->description('Select which agents can use this API key.')
                                    ->schema([
                                        CheckboxList::make('agents')
                                            ->relationship('agents', 'name')
                                            ->options(fn () => PortalAvailableAgent::query()
                                                ->where('is_active', true)
                                                ->orderBy('sort_order')
                                                ->pluck('name', 'id')
                                                ->toArray())
                                            ->descriptions(fn () => PortalAvailableAgent::query()
                                                ->where('is_active', true)
                                                ->orderBy('sort_order')
                                                ->pluck('job_title', 'id')
                                                ->toArray())
                                            ->columns(2)
                                            ->bulkToggleable()
                                            ->helperText('API keys can be shared across multiple agents'),
                                    ]),
                            ]),
                    ])
                    ->persistTabInQueryString()
                    ->columnSpanFull(),
            ]);
    }
}
