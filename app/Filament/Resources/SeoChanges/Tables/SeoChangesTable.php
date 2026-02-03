<?php

namespace App\Filament\Resources\SeoChanges\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class SeoChangesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('site.name')
                    ->label('Site')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('recommendation.title')
                    ->label('Recommendation')
                    ->limit(40)
                    ->tooltip(fn (TextColumn $column): ?string => strlen($column->getState()) > 40 ? $column->getState() : null),
                TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'applied' => 'success',
                        'failed' => 'danger',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => str($state)->title()),
                TextColumn::make('summary')
                    ->limit(50)
                    ->tooltip(fn (TextColumn $column): ?string => strlen($column->getState()) > 50 ? $column->getState() : null)
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('applied_at')
                    ->dateTime()
                    ->since()
                    ->placeholder('—'),
                TextColumn::make('created_at')
                    ->dateTime()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->options([
                        'applied' => 'Applied',
                        'failed' => 'Failed',
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
