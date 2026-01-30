<?php

namespace App\Filament\Resources\SupportRequests\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Support\Enums\FontWeight;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class SupportRequestsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('id')
                    ->label('ID')
                    ->sortable()
                    ->searchable(),
                TextColumn::make('user.name')
                    ->label('User')
                    ->searchable()
                    ->sortable()
                    ->weight(FontWeight::SemiBold),
                TextColumn::make('user.email')
                    ->label('Email')
                    ->searchable()
                    ->copyable()
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('category')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'general' => 'info',
                        'technical' => 'warning',
                        'billing' => 'success',
                        'feature_request' => 'primary',
                        'other' => 'gray',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => str($state)->replace('_', ' ')->title())
                    ->searchable()
                    ->sortable(),
                TextColumn::make('subject')
                    ->searchable()
                    ->sortable()
                    ->limit(50)
                    ->tooltip(function (TextColumn $column): ?string {
                        $state = $column->getState();

                        if (strlen($state) <= 50) {
                            return null;
                        }

                        return $state;
                    })
                    ->weight(FontWeight::Medium),
                TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'open' => 'danger',
                        'in_progress' => 'warning',
                        'resolved' => 'success',
                        'closed' => 'gray',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => str($state)->replace('_', ' ')->title())
                    ->searchable()
                    ->sortable(),
                TextColumn::make('created_at')
                    ->label('Submitted')
                    ->dateTime()
                    ->sortable()
                    ->since()
                    ->tooltip(fn ($state): string => $state->format('F j, Y \a\t g:i A')),
                TextColumn::make('resolved_at')
                    ->label('Resolved')
                    ->dateTime()
                    ->sortable()
                    ->since()
                    ->placeholder('—')
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->options([
                        'open' => 'Open',
                        'in_progress' => 'In Progress',
                        'resolved' => 'Resolved',
                        'closed' => 'Closed',
                    ])
                    ->default('open'),
                SelectFilter::make('category')
                    ->options([
                        'general' => 'General Question',
                        'technical' => 'Technical Issue',
                        'billing' => 'Billing & Account',
                        'feature_request' => 'Feature Request',
                        'other' => 'Other',
                    ]),
            ])
            ->defaultSort('created_at', 'desc')
            ->recordActions([
                ViewAction::make(),
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
