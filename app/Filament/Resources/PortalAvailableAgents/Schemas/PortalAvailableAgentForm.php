<?php

namespace App\Filament\Resources\PortalAvailableAgents\Schemas;

use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class PortalAvailableAgentForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->required(),
                TextInput::make('slug'),
                TextInput::make('job_title'),
                Textarea::make('description')
                    ->columnSpanFull(),
                TextInput::make('price')
                    ->required()
                    ->numeric()
                    ->default(0.0)
                    ->prefix('$'),
                TextInput::make('category')
                    ->required()
                    ->default('general'),
                TextInput::make('website_category'),
                TextInput::make('icon')
                    ->default('bot'),
                TextInput::make('features'),
                Toggle::make('is_popular')
                    ->required(),
                Toggle::make('is_active')
                    ->required(),
                TextInput::make('sort_order')
                    ->required()
                    ->numeric()
                    ->default(0),
                TextInput::make('section_order')
                    ->required()
                    ->numeric()
                    ->default(0),
                TextInput::make('perfect_for'),
                TextInput::make('integrations'),
                Textarea::make('image_url')
                    ->columnSpanFull(),
                TextInput::make('card_media'),
                TextInput::make('product_media'),
                TextInput::make('tiers'),
                Textarea::make('long_description')
                    ->columnSpanFull(),
            ]);
    }
}
