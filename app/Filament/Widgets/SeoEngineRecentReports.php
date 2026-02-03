<?php

namespace App\Filament\Widgets;

use App\Models\SeoReport;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget;

class SeoEngineRecentReports extends TableWidget
{
    protected int | string | array $columnSpan = 'full';

    public function table(Table $table): Table
    {
        return $table
            ->query(
                SeoReport::query()
                    ->latest('period_end')
                    ->limit(5)
            )
            ->paginated(false)
            ->columns([
                TextColumn::make('site.name')
                    ->label('Site')
                    ->searchable(),
                TextColumn::make('period_start')
                    ->label('Start')
                    ->date(),
                TextColumn::make('period_end')
                    ->label('End')
                    ->date(),
                TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'ready' => 'success',
                        'draft' => 'warning',
                        'failed' => 'danger',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => str($state)->title()),
                TextColumn::make('highlights.health_score')
                    ->label('Health')
                    ->numeric()
                    ->placeholder('—'),
            ]);
    }
}
