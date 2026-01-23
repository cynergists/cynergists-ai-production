<?php

namespace App\Filament\Resources\Cynergists\Schemas;

use App\Models\Cynergist;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TagsInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Tabs;
use Filament\Schemas\Components\Tabs\Tab;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Components\Utilities\Set;
use Filament\Schemas\Schema;
use Livewire\Features\SupportFileUploads\TemporaryUploadedFile;

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
                        Tab::make('Images')
                            ->columns(2)
                            ->schema([
                                FileUpload::make('images')
                                    ->label('Images')
                                    ->disk('public')
                                    ->directory('cynergists')
                                    ->visibility('public')
                                    ->image()
                                    ->multiple()
                                    ->reorderable()
                                    ->storeFileNamesIn('image_file_names')
                                    ->columnSpanFull()
                                    ->helperText('Upload images for this Cynergist.')
                                    ->afterStateUpdated(function ($state, Set $set, Get $get): void {
                                        $fileNames = array_values($get('image_file_names') ?? []);
                                        $images = array_values($state ?? []);

                                        if ($images === [] && $fileNames === []) {
                                            $set('main_image', null);

                                            return;
                                        }

                                        $options = $fileNames !== []
                                            ? $fileNames
                                            : array_values(array_filter(array_map(function ($image): ?string {
                                                if ($image instanceof TemporaryUploadedFile) {
                                                    return $image->getClientOriginalName();
                                                }

                                                return is_string($image) ? $image : null;
                                            }, $images)));

                                        $mainImage = $get('main_image');

                                        if ($mainImage && in_array($mainImage, $options, true)) {
                                            return;
                                        }

                                        $set('main_image', $options[0] ?? null);
                                    }),
                                Select::make('main_image')
                                    ->label('Main image')
                                    ->options(function (Get $get): array {
                                        $fileNames = $get('image_file_names') ?? [];

                                        if ($fileNames !== []) {
                                            return collect($fileNames)
                                                ->mapWithKeys(fn (string $name): array => [$name => $name])
                                                ->all();
                                        }

                                        return collect($get('images') ?? [])
                                            ->mapWithKeys(function ($path): array {
                                                if ($path instanceof TemporaryUploadedFile) {
                                                    $name = $path->getClientOriginalName();

                                                    return [$name => $name];
                                                }

                                                $value = is_string($path) ? $path : '';
                                                $label = $value !== '' ? basename($value) : 'Image';

                                                return [$value => $label];
                                            })
                                            ->all();
                                    })
                                    ->dehydrateStateUsing(function ($state, Get $get): ?string {
                                        if ($state) {
                                            return $state;
                                        }

                                        $fileNames = $get('image_file_names') ?? [];

                                        if ($fileNames !== []) {
                                            return $fileNames[0] ?? null;
                                        }

                                        $images = $get('images') ?? [];

                                        return $images[0] ?? null;
                                    })
                                    ->nullable()
                                    ->searchable()
                                    ->visible(fn (Get $get): bool => filled($get('images')) || filled($get('image_file_names')))
                                    ->helperText('Used as the primary image for this Cynergist.'),
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
