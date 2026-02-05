<?php

namespace App\Filament\Resources\SeoRecommendations\Tables;

use App\Models\SeoChange;
use App\Models\SeoRecommendation;
use App\Models\SeoRecommendationApproval;
use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\KeyValue;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SeoRecommendationsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('site.name')
                    ->label('Site')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('type')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'technical' => 'warning',
                        'on_page' => 'info',
                        'local' => 'success',
                        'schema' => 'primary',
                        'aeo' => 'gray',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => str($state)->replace('_', ' ')->title())
                    ->sortable(),
                TextColumn::make('title')
                    ->searchable()
                    ->limit(50)
                    ->tooltip(fn (TextColumn $column): ?string => strlen($column->getState()) > 50 ? $column->getState() : null),
                TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'pending' => 'warning',
                        'approved' => 'success',
                        'rejected' => 'danger',
                        'applied' => 'primary',
                        'failed' => 'danger',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => str($state)->replace('_', ' ')->title())
                    ->sortable(),
                TextColumn::make('impact_score')
                    ->label('Impact')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('effort')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'low' => 'success',
                        'medium' => 'warning',
                        'high' => 'danger',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => str($state)->title())
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('approved_at')
                    ->dateTime()
                    ->since()
                    ->placeholder('—')
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('applied_at')
                    ->dateTime()
                    ->since()
                    ->placeholder('—')
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
                        'pending' => 'Pending',
                        'approved' => 'Approved',
                        'rejected' => 'Rejected',
                        'applied' => 'Applied',
                        'failed' => 'Failed',
                    ])
                    ->default('pending'),
                SelectFilter::make('type')
                    ->options([
                        'technical' => 'Technical',
                        'on_page' => 'On-Page',
                        'local' => 'Local',
                        'schema' => 'Schema',
                        'aeo' => 'AEO',
                    ]),
                SelectFilter::make('effort')
                    ->options([
                        'low' => 'Low',
                        'medium' => 'Medium',
                        'high' => 'High',
                    ]),
            ])
            ->defaultSort('created_at', 'desc')
            ->recordActions([
                Action::make('approve')
                    ->label('Approve')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->visible(fn (SeoRecommendation $record): bool => $record->status === 'pending')
                    ->form([
                        Textarea::make('notes')
                            ->rows(3)
                            ->placeholder('Optional approval notes...'),
                    ])
                    ->action(function (SeoRecommendation $record, array $data): void {
                        DB::transaction(function () use ($record, $data): void {
                            SeoRecommendationApproval::create([
                                'id' => (string) Str::uuid(),
                                'seo_recommendation_id' => $record->id,
                                'user_id' => auth()->id(),
                                'decision' => 'approved',
                                'notes' => $data['notes'] ?? null,
                                'decided_at' => now(),
                            ]);

                            $record->update([
                                'status' => 'approved',
                                'approved_at' => now(),
                            ]);
                        });
                    })
                    ->successNotificationTitle('Recommendation approved'),
                Action::make('reject')
                    ->label('Reject')
                    ->icon('heroicon-o-x-circle')
                    ->color('danger')
                    ->visible(fn (SeoRecommendation $record): bool => $record->status === 'pending')
                    ->form([
                        Textarea::make('notes')
                            ->rows(3)
                            ->placeholder('Reason for rejection...')
                            ->required(),
                    ])
                    ->action(function (SeoRecommendation $record, array $data): void {
                        DB::transaction(function () use ($record, $data): void {
                            SeoRecommendationApproval::create([
                                'id' => (string) Str::uuid(),
                                'seo_recommendation_id' => $record->id,
                                'user_id' => auth()->id(),
                                'decision' => 'rejected',
                                'notes' => $data['notes'] ?? null,
                                'decided_at' => now(),
                            ]);

                            $record->update([
                                'status' => 'rejected',
                                'approved_at' => null,
                            ]);
                        });
                    })
                    ->successNotificationTitle('Recommendation rejected'),
                Action::make('logChange')
                    ->label('Log Change')
                    ->icon('heroicon-o-arrow-path')
                    ->color('primary')
                    ->visible(fn (SeoRecommendation $record): bool => in_array($record->status, ['approved', 'applied', 'failed'], true))
                    ->form([
                        Select::make('status')
                            ->required()
                            ->options([
                                'applied' => 'Applied',
                                'failed' => 'Failed',
                            ])
                            ->default('applied'),
                        Textarea::make('summary')
                            ->required()
                            ->rows(3)
                            ->placeholder('What was changed?'),
                        KeyValue::make('diff')
                            ->keyLabel('Field')
                            ->valueLabel('Change')
                            ->addActionLabel('Add Diff'),
                        KeyValue::make('metadata')
                            ->keyLabel('Key')
                            ->valueLabel('Value')
                            ->addActionLabel('Add Metadata'),
                    ])
                    ->action(function (SeoRecommendation $record, array $data): void {
                        DB::transaction(function () use ($record, $data): void {
                            $status = $data['status'] ?? 'applied';

                            SeoChange::create([
                                'id' => (string) Str::uuid(),
                                'seo_site_id' => $record->seo_site_id,
                                'seo_recommendation_id' => $record->id,
                                'status' => $status,
                                'summary' => $data['summary'] ?? null,
                                'diff' => $data['diff'] ?? [],
                                'metadata' => $data['metadata'] ?? [],
                                'applied_at' => $status === 'applied' ? now() : null,
                            ]);

                            if ($status === 'applied') {
                                $record->update([
                                    'status' => 'applied',
                                    'applied_at' => now(),
                                ]);
                            } else {
                                $record->update([
                                    'status' => 'failed',
                                ]);
                            }
                        });
                    })
                    ->successNotificationTitle('Change logged'),
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
