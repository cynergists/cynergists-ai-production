<?php

namespace App\Filament\Resources\PortalAvailableAgents\Schemas;

use App\Models\AgentApiKey;
use Filament\Forms\Components\CheckboxList;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\TagsInput;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Tabs;
use Filament\Schemas\Components\Tabs\Tab;
use Filament\Schemas\Schema;

class PortalAvailableAgentForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Tabs::make('Agent')
                    ->tabs([
                        Tab::make('Basic Info')
                            ->icon('heroicon-o-user')
                            ->schema([
                                Grid::make(3)
                                    ->schema([
                                        Section::make('Avatar')
                                            ->schema([
                                                FileUpload::make('avatar')
                                                    ->avatar()
                                                    ->disk('public')
                                                    ->directory('avatars')
                                                    ->imageEditor()
                                                    ->circleCropper()
                                                    ->maxSize(2048),
                                            ])
                                            ->columnSpan(1),
                                        Section::make('Identity')
                                            ->schema([
                                                TextInput::make('name')
                                                    ->required()
                                                    ->maxLength(255),
                                                TextInput::make('slug')
                                                    ->maxLength(255)
                                                    ->helperText('URL-friendly identifier'),
                                                TextInput::make('redirect_url')
                                                    ->maxLength(255)
                                                    ->url()
                                                    ->helperText('Optional: Redirect users to this URL when clicking the agent in the portal (e.g., https://apex.cynergists.com)'),
                                                TextInput::make('job_title')
                                                    ->maxLength(255)
                                                    ->placeholder('e.g., Marketing Assistant'),
                                            ])
                                            ->columnSpan(2),
                                    ]),
                                Section::make('Description')
                                    ->schema([
                                        RichEditor::make('description')
                                            ->toolbarButtons([
                                                'bold',
                                                'italic',
                                                'underline',
                                                'strike',
                                                'bulletList',
                                                'orderedList',
                                                'link',
                                            ])
                                            ->placeholder('Brief description of what this agent does...')
                                            ->columnSpanFull(),
                                    ]),
                            ]),

                        Tab::make('Details')
                            ->icon('heroicon-o-document-text')
                            ->schema([
                                Section::make('Extended Description')
                                    ->schema([
                                        RichEditor::make('long_description')
                                            ->toolbarButtons([
                                                'bold',
                                                'italic',
                                                'underline',
                                                'strike',
                                                'h2',
                                                'h3',
                                                'bulletList',
                                                'orderedList',
                                                'link',
                                                'blockquote',
                                            ])
                                            ->placeholder('Detailed description of the agent capabilities...')
                                            ->columnSpanFull(),
                                    ]),
                                Grid::make(2)
                                    ->schema([
                                        Section::make('Features & Capabilities')
                                            ->schema([
                                                TagsInput::make('features')
                                                    ->placeholder('Add a feature')
                                                    ->helperText('Press Enter to add each feature'),
                                                TagsInput::make('perfect_for')
                                                    ->placeholder('Add use case')
                                                    ->helperText('Who is this agent perfect for?'),
                                                TagsInput::make('integrations')
                                                    ->placeholder('Add integration')
                                                    ->helperText('e.g., Slack, Zapier, etc.'),
                                            ]),
                                    ]),
                            ]),

                        Tab::make('Pricing & Category')
                            ->icon('heroicon-o-currency-dollar')
                            ->schema([
                                Section::make('Pricing')
                                    ->description('Add pricing tiers for this agent. The lowest price will be shown on the marketplace. Add 2+ tiers to enable the pricing slider.')
                                    ->schema([
                                        Repeater::make('tiers')
                                            ->schema([
                                                TextInput::make('price')
                                                    ->required()
                                                    ->numeric()
                                                    ->prefix('$')
                                                    ->step(1)
                                                    ->placeholder('247'),
                                                TextInput::make('description')
                                                    ->required()
                                                    ->maxLength(255)
                                                    ->placeholder('e.g., Single Campaign, Basic Features'),
                                            ])
                                            ->columns(2)
                                            ->defaultItems(1)
                                            ->reorderable()
                                            ->collapsible()
                                            ->itemLabel(fn (array $state): ?string => $state['price'] ? '$'.number_format((float) $state['price']).' - '.($state['description'] ?? '') : null)
                                            ->addActionLabel('Add Tier'),
                                    ]),
                                Section::make('Categorization')
                                    ->schema([
                                        TextInput::make('category')
                                            ->required()
                                            ->default('general')
                                            ->placeholder('e.g., marketing, sales, support'),
                                        TagsInput::make('website_category')
                                            ->placeholder('Add category')
                                            ->helperText('e.g., New, Popular, Software'),
                                    ]),
                            ]),

                        Tab::make('Display & Media')
                            ->icon('heroicon-o-photo')
                            ->schema([
                                Grid::make(2)
                                    ->schema([
                                        Section::make('Display Settings')
                                            ->schema([
                                                TextInput::make('icon')
                                                    ->default('bot')
                                                    ->placeholder('Icon name'),
                                                TextInput::make('sort_order')
                                                    ->required()
                                                    ->numeric()
                                                    ->default(0),
                                                TextInput::make('section_order')
                                                    ->required()
                                                    ->numeric()
                                                    ->default(0),
                                            ]),
                                        Section::make('Status')
                                            ->schema([
                                                Toggle::make('is_active')
                                                    ->required()
                                                    ->default(true)
                                                    ->helperText('Is this agent available?'),
                                                Toggle::make('is_popular')
                                                    ->required()
                                                    ->default(false)
                                                    ->helperText('Show as popular/featured'),
                                                Toggle::make('is_beta')
                                                    ->required()
                                                    ->default(false)
                                                    ->helperText('Show beta badge in portal'),
                                            ]),
                                    ]),
                                Section::make('Card Media')
                                    ->description('Images and videos shown on the marketplace card (carousel). Use URL for external links or upload a file.')
                                    ->schema([
                                        Repeater::make('card_media')
                                            ->schema([
                                                TextInput::make('url')
                                                    ->label('URL or Upload')
                                                    ->placeholder('https://... or upload below')
                                                    ->helperText('Paste external URL here'),
                                                FileUpload::make('file')
                                                    ->label('Or Upload File')
                                                    ->disk('public')
                                                    ->directory('agents/card-media')
                                                    ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'])
                                                    ->maxSize(51200)
                                                    ->imagePreviewHeight('100')
                                                    ->helperText('Upload overwrites URL'),
                                                \Filament\Forms\Components\Select::make('type')
                                                    ->options([
                                                        'image' => 'Image',
                                                        'video' => 'Video',
                                                    ])
                                                    ->required()
                                                    ->default('image'),
                                            ])
                                            ->columns(3)
                                            ->defaultItems(0)
                                            ->reorderable()
                                            ->collapsible()
                                            ->itemLabel(fn (array $state): ?string => isset($state['type']) ? ucfirst($state['type']).': '.($state['url'] ?? $state['file'] ?? '') : 'Media')
                                            ->addActionLabel('Add Media'),
                                    ]),
                                Section::make('Product Page Media')
                                    ->description('Images and videos shown on the product detail page. Use URL for external links or upload a file.')
                                    ->schema([
                                        Repeater::make('product_media')
                                            ->schema([
                                                TextInput::make('url')
                                                    ->label('URL or Upload')
                                                    ->placeholder('https://... or upload below')
                                                    ->helperText('Paste external URL here'),
                                                FileUpload::make('file')
                                                    ->label('Or Upload File')
                                                    ->disk('public')
                                                    ->directory('agents/product-media')
                                                    ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'])
                                                    ->maxSize(51200)
                                                    ->imagePreviewHeight('100')
                                                    ->helperText('Upload overwrites URL'),
                                                \Filament\Forms\Components\Select::make('type')
                                                    ->options([
                                                        'image' => 'Image',
                                                        'video' => 'Video',
                                                    ])
                                                    ->required()
                                                    ->default('image'),
                                            ])
                                            ->columns(3)
                                            ->defaultItems(0)
                                            ->reorderable()
                                            ->collapsible()
                                            ->itemLabel(fn (array $state): ?string => isset($state['type']) ? ucfirst($state['type']).': '.($state['url'] ?? $state['file'] ?? '') : 'Media')
                                            ->addActionLabel('Add Media'),
                                    ]),
                            ]),

                        Tab::make('API Keys')
                            ->icon('heroicon-o-key')
                            ->schema([
                                Section::make('Attached API Keys')
                                    ->description('Select which API keys this agent can use for external integrations')
                                    ->schema([
                                        CheckboxList::make('apiKeys')
                                            ->relationship('apiKeys', 'name')
                                            ->options(function () {
                                                return AgentApiKey::query()
                                                    ->active()
                                                    ->get()
                                                    ->mapWithKeys(function ($key) {
                                                        $label = $key->name;
                                                        $label .= ' ('.ucfirst($key->provider).')';
                                                        if ($key->isExpired()) {
                                                            $label .= ' [EXPIRED]';
                                                        }

                                                        return [$key->id => $label];
                                                    });
                                            })
                                            ->descriptions(function () {
                                                return AgentApiKey::query()
                                                    ->active()
                                                    ->get()
                                                    ->mapWithKeys(function ($key) {
                                                        $desc = 'Provider: '.ucfirst($key->provider);
                                                        if ($key->expires_at) {
                                                            $desc .= ' | Expires: '.$key->expires_at->format('M j, Y');
                                                        }

                                                        return [$key->id => $desc];
                                                    });
                                            })
                                            ->columns(2)
                                            ->searchable()
                                            ->bulkToggleable()
                                            ->helperText('These API keys will be available for this agent to use when interacting with external services like LinkedIn (Unipile), web scraping (Apify), or AI (OpenAI).'),
                                    ]),
                            ]),
                    ])
                    ->persistTabInQueryString()
                    ->columnSpanFull(),
            ]);
    }
}
