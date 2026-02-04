<?php

namespace App\Http\Controllers;

use App\Models\SeoReport;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class SeoReportController extends Controller
{
    public function show(Request $request, SeoReport $report): Response
    {
        $report->loadMissing('site:id,name,url');

        return response()->view('reports.seo-report', [
            'report' => $report,
            'site' => $report->site,
            'highlights' => $report->highlights ?? [],
            'metrics' => $report->metrics ?? [],
        ]);
    }

    public function download(Request $request, SeoReport $report): Response
    {
        $report->loadMissing('site:id,name,url');

        $payload = [
            'id' => $report->id,
            'site' => $report->site ? [
                'id' => $report->site->id,
                'name' => $report->site->name,
                'url' => $report->site->url,
            ] : null,
            'period_start' => $report->period_start?->toDateString(),
            'period_end' => $report->period_end?->toDateString(),
            'status' => $report->status,
            'highlights' => $report->highlights ?? [],
            'metrics' => $report->metrics ?? [],
            'created_at' => $report->created_at?->toIso8601String(),
        ];

        $fileName = sprintf(
            'seo-report-%s-%s.json',
            Str::slug((string) ($report->site?->name ?? 'site')),
            $report->period_end?->format('Y-m-d') ?? now()->format('Y-m-d'),
        );

        return response()->streamDownload(
            static function () use ($payload): void {
                echo json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
            },
            $fileName,
            ['Content-Type' => 'application/json']
        );
    }
}
