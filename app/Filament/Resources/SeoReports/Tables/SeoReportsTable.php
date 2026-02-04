<?php

namespace App\Filament\Resources\SeoReports\Tables;

use App\Models\SeoReport;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Actions\Action;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class SeoReportsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('site.name')
                    ->label('Site')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('period_start')
                    ->label('Start')
                    ->date()
                    ->sortable(),
                TextColumn::make('period_end')
                    ->label('End')
                    ->date()
                    ->sortable(),
                TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'ready' => 'success',
                        'draft' => 'warning',
                        'failed' => 'danger',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => str($state)->title())
                    ->sortable(),
                TextColumn::make('highlights.health_score')
                    ->label('Health')
                    ->numeric()
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('highlights.keywords_moved')
                    ->label('Keywords Moved')
                    ->numeric()
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('created_at')
                    ->dateTime()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('seo_site_id')
                    ->label('Site')
                    ->relationship('site', 'name')
                    ->searchable()
                    ->preload(),
                SelectFilter::make('status')
                    ->options([
                        'ready' => 'Ready',
                        'draft' => 'Draft',
                        'failed' => 'Failed',
                    ]),
            ])
            ->defaultSort('period_end', 'desc')
            ->recordActions([
                Action::make('viewReport')
                    ->label('View')
                    ->icon('heroicon-o-eye')
                    ->url(fn (SeoReport $record): string => route('reports.seo.show', $record))
                    ->openUrlInNewTab(),
                Action::make('downloadReport')
                    ->label('Download')
                    ->icon('heroicon-o-arrow-down-tray')
                    ->url(fn (SeoReport $record): string => route('reports.seo.download', $record))
                    ->openUrlInNewTab(),
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
