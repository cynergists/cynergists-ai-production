<?php

namespace App\Filament\Resources\SeoSites\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class SeoSitesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('url')
                    ->label('URL')
                    ->searchable()
                    ->url(fn ($record): string => $record->url, true)
                    ->openUrlInNewTab(),
                TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'active' => 'success',
                        'paused' => 'warning',
                        'archived' => 'gray',
                        default => 'gray',
                    })
                    ->sortable(),
                TextColumn::make('tenant.company_name')
                    ->label('Tenant')
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('owner.name')
                    ->label('Owner')
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('last_audit_at')
                    ->label('Last Audit')
                    ->dateTime()
                    ->since()
                    ->placeholder('—')
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->options([
                        'active' => 'Active',
                        'paused' => 'Paused',
                        'archived' => 'Archived',
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
