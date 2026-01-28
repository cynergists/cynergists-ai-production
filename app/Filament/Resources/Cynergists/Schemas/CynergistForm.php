<?php

namespace App\Filament\Resources\Cynergists\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class CynergistForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->required(),
                TextInput::make('title')
                    ->required(),
                Textarea::make('mission')
                    ->required()
                    ->columnSpanFull(),
                TextInput::make('color_key'),
                TextInput::make('type')
                    ->required(),
                TextInput::make('capabilities')
                    ->required(),
                TextInput::make('images'),
                FileUpload::make('image_file_names')
                    ->image(),
                FileUpload::make('main_image')
                    ->image(),
                Toggle::make('popular')
                    ->required(),
            ]);
    }
}
