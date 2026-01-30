<?php

namespace App\Filament\Resources\SupportRequests\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class SupportRequestForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Request Details')
                    ->description('Information about the support request')
                    ->schema([
                        Select::make('user_id')
                            ->label('User')
                            ->relationship('user', 'name')
                            ->searchable()
                            ->preload()
                            ->required()
                            ->disabled()
                            ->dehydrated(),
                        Select::make('category')
                            ->options([
                                'general' => 'General Question',
                                'technical' => 'Technical Issue',
                                'billing' => 'Billing & Account',
                                'feature_request' => 'Feature Request',
                                'other' => 'Other',
                            ])
                            ->required()
                            ->disabled()
                            ->dehydrated(),
                        TextInput::make('subject')
                            ->required()
                            ->maxLength(200)
                            ->disabled()
                            ->dehydrated()
                            ->columnSpanFull(),
                        Textarea::make('message')
                            ->required()
                            ->rows(6)
                            ->disabled()
                            ->dehydrated()
                            ->columnSpanFull(),
                    ])
                    ->columns(2),

                Section::make('Support Team Response')
                    ->description('Update status and add notes for this support request')
                    ->schema([
                        Select::make('status')
                            ->options([
                                'open' => 'Open',
                                'in_progress' => 'In Progress',
                                'resolved' => 'Resolved',
                                'closed' => 'Closed',
                            ])
                            ->required()
                            ->default('open')
                            ->live()
                            ->afterStateUpdated(function ($state, callable $set) {
                                if (in_array($state, ['resolved', 'closed'])) {
                                    $set('resolved_at', now());
                                } else {
                                    $set('resolved_at', null);
                                }
                            }),
                        DateTimePicker::make('resolved_at')
                            ->label('Resolved At')
                            ->seconds(false),
                        Textarea::make('admin_notes')
                            ->label('Admin Notes')
                            ->placeholder('Add internal notes about this support request...')
                            ->rows(4)
                            ->columnSpanFull(),
                    ])
                    ->columns(2),
            ]);
    }
}
