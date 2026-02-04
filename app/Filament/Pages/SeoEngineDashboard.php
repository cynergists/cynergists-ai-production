<?php

namespace App\Filament\Pages;

use App\Filament\Widgets\SeoEngineRecentRecommendations;
use App\Filament\Widgets\SeoEngineRecentReports;
use App\Filament\Widgets\SeoEngineStats;
use Filament\Pages\Dashboard as BaseDashboard;
use Filament\Support\Icons\Heroicon;

class SeoEngineDashboard extends BaseDashboard
{
    protected static string $routePath = '/seo-engine';

    protected static ?string $navigationLabel = 'Carbon Dashboard';

    protected static string|\UnitEnum|null $navigationGroup = 'Carbon';

    protected static string|\BackedEnum|null $navigationIcon = Heroicon::OutlinedChartBar;

    protected static ?int $navigationSort = 0;

    public function getTitle(): string
    {
        return 'Carbon';
    }

    public function getWidgets(): array
    {
        return [
            SeoEngineStats::class,
            SeoEngineRecentRecommendations::class,
            SeoEngineRecentReports::class,
        ];
    }
}
