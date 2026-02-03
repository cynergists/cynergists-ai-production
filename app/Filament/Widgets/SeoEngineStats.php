<?php

namespace App\Filament\Widgets;

use App\Models\SeoChange;
use App\Models\SeoRecommendation;
use App\Models\SeoReport;
use App\Models\SeoSite;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class SeoEngineStats extends StatsOverviewWidget
{
    protected function getStats(): array
    {
        $activeSites = SeoSite::query()->where('status', 'active')->count();
        $pendingRecommendations = SeoRecommendation::query()->where('status', 'pending')->count();
        $approvedRecommendations = SeoRecommendation::query()->where('status', 'approved')->count();
        $changesApplied = SeoChange::query()->where('status', 'applied')->count();
        $reportsReady = SeoReport::query()->where('status', 'ready')->count();

        return [
            Stat::make('Active Sites', $activeSites)
                ->description('Tracked websites')
                ->descriptionIcon('heroicon-o-globe-alt')
                ->color('primary'),
            Stat::make('Pending Recommendations', $pendingRecommendations)
                ->description('Awaiting review')
                ->descriptionIcon('heroicon-o-clock')
                ->color('warning'),
            Stat::make('Approved (Unapplied)', $approvedRecommendations)
                ->description('Ready for execution')
                ->descriptionIcon('heroicon-o-check-circle')
                ->color('success'),
            Stat::make('Changes Applied', $changesApplied)
                ->description('Completed updates')
                ->descriptionIcon('heroicon-o-arrow-path')
                ->color('info'),
            Stat::make('Reports Ready', $reportsReady)
                ->description('Generated reports')
                ->descriptionIcon('heroicon-o-document-chart-bar')
                ->color('primary'),
        ];
    }
}
