<?php

namespace App\Filament\Resources\SeoReports\Pages;

use App\Filament\Resources\SeoReports\SeoReportResource;
use App\Models\SeoSite;
use App\Services\SeoEngine\SeoReportGenerator;
use Filament\Actions\Action;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Select;
use Filament\Resources\Pages\ListRecords;

class ListSeoReports extends ListRecords
{
    protected static string $resource = SeoReportResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('generateReport')
                ->label('Generate Report')
                ->icon('heroicon-o-document-chart-bar')
                ->color('primary')
                ->form([
                    Select::make('seo_site_id')
                        ->label('Site')
                        ->options(fn () => SeoSite::query()
                            ->orderBy('name')
                            ->pluck('name', 'id')
                            ->toArray())
                        ->searchable()
                        ->required(),
                    DatePicker::make('period_start')
                        ->label('Period Start')
                        ->required()
                        ->default(now()->subMonthNoOverflow()->startOfMonth()),
                    DatePicker::make('period_end')
                        ->label('Period End')
                        ->required()
                        ->default(now()->subMonthNoOverflow()->endOfMonth()),
                ])
                ->action(function (array $data): void {
                    $site = SeoSite::query()->findOrFail($data['seo_site_id']);

                    app(SeoReportGenerator::class)->generateForSite(
                        $site,
                        $data['period_start'],
                        $data['period_end'],
                    );
                })
                ->successNotificationTitle('Report generated'),
        ];
    }
}
