<?php

namespace App\Filament\Resources\PartnerAssets\Schemas;

use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class PartnerAssetForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('title')
                    ->required(),
                Textarea::make('description')
                    ->columnSpanFull(),
                TextInput::make('asset_type')
                    ->required()
                    ->default('copy'),
                TextInput::make('category')
                    ->required()
                    ->default('copy'),
                Textarea::make('file_url')
                    ->required()
                    ->columnSpanFull(),
                Textarea::make('thumbnail_url')
                    ->columnSpanFull(),
                Toggle::make('is_active')
                    ->required(),
                TextInput::make('display_order')
                    ->required()
                    ->numeric()
                    ->default(0),
            ]);
    }
}
