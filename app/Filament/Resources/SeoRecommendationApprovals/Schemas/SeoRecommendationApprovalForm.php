<?php

namespace App\Filament\Resources\SeoRecommendationApprovals\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class SeoRecommendationApprovalForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Grid::make(2)
                    ->schema([
                        Section::make('Decision')
                            ->schema([
                                Select::make('seo_recommendation_id')
                                    ->label('Recommendation')
                                    ->relationship('recommendation', 'title')
                                    ->required()
                                    ->searchable()
                                    ->preload(),
                                Select::make('user_id')
                                    ->label('Reviewer')
                                    ->relationship('user', 'name')
                                    ->searchable()
                                    ->preload(),
                                Select::make('decision')
                                    ->required()
                                    ->options([
                                        'approved' => 'Approved',
                                        'rejected' => 'Rejected',
                                    ])
                                    ->default('approved'),
                                DateTimePicker::make('decided_at'),
                            ]),
                        Section::make('Notes')
                            ->schema([
                                Textarea::make('notes')
                                    ->rows(4)
                                    ->placeholder('Optional reviewer notes...'),
                            ]),
                    ]),
            ]);
    }
}
