<?php

namespace App\Services\Specter;

class SpecterBotFilterService
{
    public function isBot(?string $userAgent, array $event = []): bool
    {
        $ua = strtolower((string) $userAgent);

        if ($ua === '') {
            return false;
        }

        foreach (['bot', 'crawler', 'spider', 'slurp', 'headless', 'lighthouse'] as $needle) {
            if (str_contains($ua, $needle)) {
                return true;
            }
        }

        $metadata = $event['metadata'] ?? [];
        if (is_array($metadata) && (($metadata['is_bot'] ?? false) === true)) {
            return true;
        }

        return false;
    }
}
