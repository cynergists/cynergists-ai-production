<?php

namespace App\Filament\Resources\SeoRecommendationApprovals\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class SeoRecommendationApprovalsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('recommendation.title')
                    ->label('Recommendation')
                    ->searchable()
                    ->limit(40)
                    ->tooltip(fn (TextColumn $column): ?string => strlen($column->getState()) > 40 ? $column->getState() : null),
                TextColumn::make('recommendation.site.name')
                    ->label('Site')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('decision')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'approved' => 'success',
                        'rejected' => 'danger',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => str($state)->title()),
                TextColumn::make('user.name')
                    ->label('Reviewer')
                    ->searchable()
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('decided_at')
                    ->dateTime()
                    ->since()
                    ->placeholder('—'),
                TextColumn::make('created_at')
                    ->dateTime()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('decision')
                    ->options([
                        'approved' => 'Approved',
                        'rejected' => 'Rejected',
                    ]),
            ])
            ->defaultSort('created_at', 'desc')
            ->recordActions([
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
