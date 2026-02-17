@php
    use Illuminate\Support\Str;

    $siteName = $site?->name ?? 'Site';
    $siteUrl = $site?->url ?? null;
    $periodStart = $report->period_start?->format('M d, Y') ?? 'N/A';
    $periodEnd = $report->period_end?->format('M d, Y') ?? 'N/A';
    $statusLabel = Str::of($report->status)->replace('_', ' ')->title();
@endphp
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>SEO Report - {{ $siteName }}</title>
        <style>
            :root {
                color-scheme: light;
            }
            body {
                font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
                margin: 0;
                background: #f5f5f7;
                color: #111827;
            }
            .page {
                max-width: 960px;
                margin: 32px auto;
                background: #ffffff;
                padding: 32px;
                border-radius: 16px;
                box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
            }
            header {
                border-bottom: 1px solid #e5e7eb;
                padding-bottom: 20px;
                margin-bottom: 24px;
            }
            h1 {
                margin: 0 0 8px;
                font-size: 28px;
            }
            .meta {
                display: flex;
                flex-wrap: wrap;
                gap: 12px 24px;
                font-size: 14px;
                color: #4b5563;
            }
            .badge {
                display: inline-flex;
                align-items: center;
                padding: 4px 10px;
                border-radius: 999px;
                background: #ecfdf3;
                color: #15803d;
                font-weight: 600;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 0.04em;
            }
            section {
                margin-bottom: 28px;
            }
            h2 {
                font-size: 18px;
                margin-bottom: 12px;
            }
            .grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 16px;
            }
            .card {
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                padding: 16px;
                background: #f9fafb;
            }
            .card h3 {
                margin: 0 0 8px;
                font-size: 14px;
                color: #6b7280;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }
            .card p {
                margin: 0;
                font-size: 20px;
                font-weight: 600;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                font-size: 14px;
            }
            th,
            td {
                text-align: left;
                padding: 10px 12px;
                border-bottom: 1px solid #e5e7eb;
            }
            th {
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 0.06em;
                color: #6b7280;
            }
            footer {
                font-size: 12px;
                color: #6b7280;
                border-top: 1px solid #e5e7eb;
                padding-top: 16px;
            }
        </style>
    </head>
    <body>
        <div class="page">
            <header>
                <h1>SEO Report</h1>
                <div class="meta">
                    <div>
                        <strong>Site:</strong> {{ $siteName }}
                        @if ($siteUrl)
                            <span>({{ $siteUrl }})</span>
                        @endif
                    </div>
                    <div><strong>Period:</strong> {{ $periodStart }} - {{ $periodEnd }}</div>
                    <div><strong>Status:</strong> <span class="badge">{{ $statusLabel }}</span></div>
                </div>
            </header>

            <section>
                <h2>Highlights</h2>
                @if (! empty($highlights))
                    <div class="grid">
                        @foreach ($highlights as $key => $value)
                            <div class="card">
                                <h3>{{ Str::of($key)->replace('_', ' ')->title() }}</h3>
                                <p>{{ is_array($value) ? json_encode($value) : $value }}</p>
                            </div>
                        @endforeach
                    </div>
                @else
                    <p>No highlights available for this period.</p>
                @endif
            </section>

            <section>
                <h2>Metrics</h2>
                @if (! empty($metrics))
                    <table>
                        <thead>
                            <tr>
                                <th>Metric</th>
                                <th>Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach ($metrics as $key => $value)
                                <tr>
                                    <td>{{ Str::of($key)->replace('_', ' ')->title() }}</td>
                                    <td>{{ is_array($value) ? json_encode($value) : $value }}</td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                @else
                    <p>No metrics recorded yet.</p>
                @endif
            </section>

            <footer>
                Generated {{ now()->format('M d, Y \\a\\t g:i A') }}.
            </footer>
        </div>
    </body>
</html>
