<?php

namespace App\Filament\Resources\Cynergists\Schemas;

use App\Models\Cynergist;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TagsInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Tabs;
use Filament\Schemas\Components\Tabs\Tab;
use Filament\Schemas\Schema;

class CynergistForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(1)
            ->components([
                Tabs::make('Cynergist details')
                    ->columnSpanFull()
                    ->tabs([
                        Tab::make('Profile')
                            ->columns(2)
                            ->schema([
                                TextInput::make('name')
                                    ->required()
                                    ->maxLength(255)
                                    ->unique(Cynergist::class, 'name', ignoreRecord: true),
                                TextInput::make('title')
                                    ->required()
                                    ->maxLength(255),
                                Textarea::make('mission')
                                    ->required()
                                    ->rows(4)
                                    ->columnSpanFull(),
                            ]),
                        Tab::make('Classification')
                            ->columns(2)
                            ->schema([
                                Select::make('type')
                                    ->options([
                                        'featured' => 'Featured',
                                        'specialized' => 'Specialized',
                                    ])
                                    ->required(),
                                TextInput::make('color_key')
                                    ->label('Color key')
                                    ->maxLength(255)
                                    ->placeholder('apex'),
                                TagsInput::make('capabilities')
                                    ->required()
                                    ->columnSpanFull(),
                                Toggle::make('popular')
                                    ->helperText('Highlight in featured sections.'),
                            ]),
                        Tab::make('Assigned users')
                            ->schema([
                                Select::make('users')
                                    ->relationship('users', 'name')
                                    ->getOptionLabelFromRecordUsing(
                                        fn ($record): string => "{$record->name} ({$record->email})",
                                    )
                                    ->multiple()
                                    ->preload()
                                    ->searchable()
                                    ->helperText('Attach users who should have this Cynergist.'),
                            ]),
                    ]),
            ]);
    }
}
