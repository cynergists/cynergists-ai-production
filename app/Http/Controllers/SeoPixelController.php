<?php

namespace App\Http\Controllers;

use App\Models\SeoSite;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class SeoPixelController extends Controller
{
    public function script(string $trackingId): Response
    {
        $site = SeoSite::query()->where('tracking_id', $trackingId)->first();

        if (! $site) {
            return response('/* Pixel not found */', 404)
                ->header('Content-Type', 'application/javascript');
        }

        $collectUrl = url("/api/seo/pixel/{$trackingId}/collect");

        $script = <<<JS
(function () {
  var payload = {
    url: window.location.href,
    referrer: document.referrer || null,
    title: document.title || null,
    ts: new Date().toISOString()
  };
  var endpoint = '{$collectUrl}';

  if (navigator.sendBeacon) {
    var blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    navigator.sendBeacon(endpoint, blob);
    return;
  }

  fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true,
    mode: 'cors'
  }).catch(function () {});
})();
JS;

        return response($script, 200)
            ->header('Content-Type', 'application/javascript')
            ->header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
            ->header('Access-Control-Allow-Origin', '*');
    }

    public function collect(Request $request, string $trackingId): JsonResponse
    {
        if ($request->getMethod() === 'OPTIONS') {
            return response()->json([], 204)->withHeaders($this->corsHeaders());
        }

        $site = SeoSite::query()->where('tracking_id', $trackingId)->first();

        if (! $site) {
            return response()->json(['status' => 'not_found'], 404)->withHeaders($this->corsHeaders());
        }

        $site->pixel_last_seen_at = now();

        if ($site->pixel_install_status !== 'installed') {
            $site->pixel_install_status = 'installed';
        }

        if (! $site->pixel_install_method) {
            $site->pixel_install_method = 'manual';
        }

        $site->save();

        return response()->json([
            'status' => 'ok',
            'site_id' => $site->id,
        ])->withHeaders($this->corsHeaders());
    }

    /**
     * @return array<string, string>
     */
    private function corsHeaders(): array
    {
        return [
            'Access-Control-Allow-Origin' => '*',
            'Access-Control-Allow-Methods' => 'POST, OPTIONS',
            'Access-Control-Allow-Headers' => 'Content-Type',
        ];
    }
}
