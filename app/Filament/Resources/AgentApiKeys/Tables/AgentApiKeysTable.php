<?php

namespace App\Filament\Resources\AgentApiKeys\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;

class AgentApiKeysTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->searchable()
                    ->sortable()
                    ->description(fn ($record) => 'ID: '.substr($record->id, 0, 8).'...'),
                TextColumn::make('provider')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'openai' => 'success',
                        'unipile' => 'info',
                        'apify' => 'warning',
                        'elevenlabs' => 'danger',
                        'resend' => 'gray',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'openai' => 'OpenAI',
                        'unipile' => 'Unipile',
                        'apify' => 'Apify',
                        'elevenlabs' => 'ElevenLabs',
                        'resend' => 'Resend',
                        default => ucfirst($state),
                    })
                    ->searchable()
                    ->sortable(),
                TextColumn::make('agents_count')
                    ->counts('agents')
                    ->label('Agents')
                    ->badge()
                    ->color('gray'),
                IconColumn::make('is_active')
                    ->boolean()
                    ->label('Active'),
                TextColumn::make('expires_at')
                    ->dateTime()
                    ->sortable()
                    ->placeholder('Never')
                    ->color(fn ($record) => $record->expires_at?->isPast() ? 'danger' : null)
                    ->description(fn ($record) => $record->expires_at?->isPast() ? 'Expired' : null),
                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('provider')
                    ->options([
                        'openai' => 'OpenAI',
                        'unipile' => 'Unipile',
                        'apify' => 'Apify',
                        'elevenlabs' => 'ElevenLabs',
                        'resend' => 'Resend',
                    ]),
                TernaryFilter::make('is_active')
                    ->label('Active Status'),
            ])
            ->recordActions([
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('created_at', 'desc');
    }
}
