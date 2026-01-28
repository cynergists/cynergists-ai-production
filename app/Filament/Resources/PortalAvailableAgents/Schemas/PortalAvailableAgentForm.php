<?php

namespace App\Filament\Resources\PortalAvailableAgents\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\TagsInput;
use Filament\Forms\Components\Textarea;
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
                                        Section::make('Tiers')
                                            ->schema([
                                                Textarea::make('tiers')
                                                    ->rows(5)
                                                    ->placeholder('JSON array of tier configurations')
                                                    ->helperText('Advanced: Enter as JSON array'),
                                            ]),
                                    ]),
                            ]),

                        Tab::make('Pricing & Category')
                            ->icon('heroicon-o-currency-dollar')
                            ->schema([
                                Grid::make(2)
                                    ->schema([
                                        Section::make('Pricing')
                                            ->schema([
                                                TextInput::make('price')
                                                    ->required()
                                                    ->numeric()
                                                    ->default(0.0)
                                                    ->prefix('$')
                                                    ->step(0.01),
                                            ]),
                                        Section::make('Categorization')
                                            ->schema([
                                                TextInput::make('category')
                                                    ->required()
                                                    ->default('general')
                                                    ->placeholder('e.g., marketing, sales, support'),
                                                TagsInput::make('website_category')
                                                    ->placeholder('Add category')
                                                    ->helperText('Categories for website display'),
                                            ]),
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
                                            ]),
                                    ]),
                                Section::make('Media URLs')
                                    ->description('External URLs for media assets')
                                    ->schema([
                                        Textarea::make('image_url')
                                            ->rows(2)
                                            ->placeholder('https://...')
                                            ->columnSpanFull(),
                                        Grid::make(2)
                                            ->schema([
                                                Textarea::make('card_media')
                                                    ->rows(3)
                                                    ->placeholder('JSON for card media')
                                                    ->helperText('Card display media config'),
                                                Textarea::make('product_media')
                                                    ->rows(3)
                                                    ->placeholder('JSON for product media')
                                                    ->helperText('Product page media config'),
                                            ]),
                                    ]),
                            ]),
                    ])
                    ->persistTabInQueryString()
                    ->columnSpanFull(),
            ]);
    }
}
