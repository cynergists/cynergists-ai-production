<?php

namespace App\Services\Specter;

use App\Models\PortalTenant;
use App\Models\SpecterScoringRule;
use App\Models\SpecterSession;
use Illuminate\Support\Collection;

class SpecterIntentScoringService
{
    /**
     * Score a session using configurable rules and persist results.
     *
     * @return array{intent_score:int,intent_tier:string,heat_zone:string,scoring_feature_breakdown:array<string,mixed>}
     */
    public function scoreSession(SpecterSession $session, ?PortalTenant $tenant = null): array
    {
        $session->loadMissing('events', 'visitor');
        $tenant ??= $session->visitor?->tenant;

        $rules = $this->resolveRules($tenant);
        $features = $this->extractFeatures($session, $tenant);

        $breakdown = [];
        $score = 0.0;

        foreach ($rules as $rule) {
            $signalKey = $rule['signal_key'];
            $featureValue = $features[$signalKey] ?? 0;
            $points = $this->evaluateRulePoints($rule, $featureValue);
            $score += $points;

            $breakdown[$signalKey] = [
                'value' => $featureValue,
                'weight' => (float) $rule['weight'],
                'points' => round($points, 2),
                'config' => $rule['config'],
            ];
        }

        $intentScore = max(0, (int) round($score));
        $tierThresholds = $tenant?->settings['specter_data']['tier_thresholds'] ?? [
            'medium' => 35,
            'high' => 70,
        ];

        $intentTier = $intentScore >= ($tierThresholds['high'] ?? 70)
            ? 'high'
            : ($intentScore >= ($tierThresholds['medium'] ?? 35) ? 'medium' : 'low');

        $heatZone = $this->determineHeatZone($session, $intentTier);

        $metrics = $session->metrics ?? [];
        $metrics['scored_at'] = now()->toIso8601String();
        $metrics['feature_snapshot'] = $features;

        $session->update([
            'intent_score' => $intentScore,
            'intent_tier' => $intentTier,
            'heat_zone' => $heatZone,
            'scoring_feature_breakdown' => $breakdown,
            'metrics' => $metrics,
        ]);

        return [
            'intent_score' => $intentScore,
            'intent_tier' => $intentTier,
            'heat_zone' => $heatZone,
            'scoring_feature_breakdown' => $breakdown,
        ];
    }

    /**
     * @return Collection<int, array{signal_key:string,weight:float,config:array}>
     */
    private function resolveRules(?PortalTenant $tenant): Collection
    {
        $rows = SpecterScoringRule::query()
            ->where('is_active', true)
            ->where(function ($query) use ($tenant) {
                $query->whereNull('tenant_id');

                if ($tenant) {
                    $query->orWhere('tenant_id', $tenant->id);
                }
            })
            ->orderByRaw('CASE WHEN tenant_id IS NULL THEN 1 ELSE 0 END')
            ->orderBy('sort_order')
            ->get();

        if ($rows->isEmpty()) {
            return collect($this->defaultRules());
        }

        return $rows->map(fn (SpecterScoringRule $rule) => [
            'signal_key' => $rule->signal_key,
            'weight' => (float) $rule->weight,
            'config' => is_array($rule->config) ? $rule->config : [],
        ]);
    }

    /**
     * @return array<int, array{signal_key:string,weight:float,config:array}>
     */
    private function defaultRules(): array
    {
        return [
            ['signal_key' => 'duration_seconds', 'weight' => 0.20, 'config' => ['tiers' => [60 => 10, 180 => 20, 300 => 30]]],
            ['signal_key' => 'scroll_depth_max', 'weight' => 0.15, 'config' => ['tiers' => [25 => 5, 50 => 10, 75 => 20]]],
            ['signal_key' => 'key_page_visits', 'weight' => 1.00, 'config' => ['tiers' => [1 => 15, 2 => 30, 3 => 40]]],
            ['signal_key' => 'return_visit_recent', 'weight' => 1.00, 'config' => ['tiers' => [1 => 15]]],
            ['signal_key' => 'form_interaction_strength', 'weight' => 1.00, 'config' => ['tiers' => [1 => 10, 2 => 25, 3 => 40]]],
            ['signal_key' => 'navigation_depth', 'weight' => 1.00, 'config' => ['tiers' => [2 => 5, 4 => 15, 6 => 25]]],
        ];
    }

    /**
     * @return array<string,int|float>
     */
    private function extractFeatures(SpecterSession $session, ?PortalTenant $tenant): array
    {
        $events = $session->events;
        $startedAt = $session->started_at ?? $events->min('occurred_at') ?? now();
        $endedAt = $session->ended_at ?? $events->max('occurred_at') ?? now();
        $durationSeconds = max(0, $endedAt->diffInSeconds($startedAt));

        $scrollDepthMax = (int) $events
            ->where('type', 'scroll')
            ->map(fn ($event) => (int) (($event->metadata['depth'] ?? $event->metadata['scroll_depth'] ?? 0)))
            ->max();

        $pageViews = $events->where('type', 'page_view');
        $highIntentPatterns = $tenant?->settings['specter_data']['high_intent_pages'] ?? [
            '/pricing',
            '/demo',
            '/contact',
            '/checkout',
            '#^/services#',
        ];

        $keyPageVisits = $pageViews->filter(function ($event) use ($highIntentPatterns) {
            $path = $this->normalizePathFromUrl((string) ($event->page_url ?? ''));
            foreach ($highIntentPatterns as $pattern) {
                if (! is_string($pattern) || $pattern === '') {
                    continue;
                }

                if (str_starts_with($pattern, '#') && @preg_match($pattern, $path) === 1) {
                    return true;
                }

                if ($path === $pattern || str_starts_with($path, rtrim($pattern, '/').'/')) {
                    return true;
                }
            }

            return false;
        })->count();

        $priorSessions = SpecterSession::query()
            ->where('specter_visitor_id', $session->specter_visitor_id)
            ->where('id', '!=', $session->id)
            ->where('created_at', '>=', now()->subDays(30))
            ->count();

        $formStrength = 0;
        if ($events->contains(fn ($event) => $event->type === 'form_view')) {
            $formStrength = max($formStrength, 1);
        }
        if ($events->contains(fn ($event) => $event->type === 'form_start')) {
            $formStrength = max($formStrength, 2);
        }
        if ($events->contains(fn ($event) => $event->type === 'form_submit')) {
            $formStrength = max($formStrength, 3);
        }

        $navigationDepth = (int) $pageViews
            ->pluck('page_url')
            ->filter()
            ->map(fn ($url) => $this->normalizePathFromUrl((string) $url))
            ->unique()
            ->count();

        return [
            'duration_seconds' => $durationSeconds,
            'scroll_depth_max' => $scrollDepthMax,
            'key_page_visits' => $keyPageVisits,
            'return_visit_recent' => $priorSessions > 0 ? 1 : 0,
            'form_interaction_strength' => $formStrength,
            'navigation_depth' => $navigationDepth,
        ];
    }

    private function evaluateRulePoints(array $rule, int|float $value): float
    {
        $tiers = $rule['config']['tiers'] ?? [];
        if (! is_array($tiers) || $tiers === []) {
            return (float) $value * (float) $rule['weight'];
        }

        $bestPoints = 0.0;
        foreach ($tiers as $threshold => $points) {
            if ($value >= (float) $threshold) {
                $bestPoints = max($bestPoints, (float) $points);
            }
        }

        return $bestPoints * (float) $rule['weight'];
    }

    private function determineHeatZone(SpecterSession $session, string $intentTier): string
    {
        if ($session->events->contains(fn ($event) => in_array($event->type, ['form_start', 'form_submit'], true))) {
            return $intentTier === 'low' ? 'medium' : $intentTier;
        }

        return $intentTier;
    }

    private function normalizePathFromUrl(string $url): string
    {
        $path = parse_url($url, PHP_URL_PATH);

        return is_string($path) && $path !== '' ? rtrim($path, '/') ?: '/' : '/';
    }
}
