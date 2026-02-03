<?php

namespace App\Filament\Widgets;

use App\Models\SeoRecommendation;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget;

class SeoEngineRecentRecommendations extends TableWidget
{
    protected int | string | array $columnSpan = 'full';

    public function table(Table $table): Table
    {
        return $table
            ->query(
                SeoRecommendation::query()
                    ->latest('created_at')
                    ->limit(5)
            )
            ->paginated(false)
            ->columns([
                TextColumn::make('site.name')
                    ->label('Site')
                    ->searchable(),
                TextColumn::make('title')
                    ->limit(40)
                    ->tooltip(fn (TextColumn $column): ?string => strlen($column->getState()) > 40 ? $column->getState() : null),
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
                    ->formatStateUsing(fn (string $state): string => str($state)->replace('_', ' ')->title()),
                TextColumn::make('impact_score')
                    ->label('Impact')
                    ->numeric(),
                TextColumn::make('created_at')
                    ->dateTime()
                    ->since(),
            ]);
    }
}
