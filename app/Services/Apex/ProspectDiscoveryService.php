<?php

namespace App\Services\Apex;

use App\Models\ApexActivityLog;
use App\Models\ApexCampaign;
use App\Models\ApexCampaignProspect;
use App\Models\ApexLinkedInAccount;
use App\Models\ApexProspect;
use Illuminate\Support\Facades\Log;

class ProspectDiscoveryService
{
    /**
     * Discover new prospects for a campaign via LinkedIn search.
     */
    public function discover(UnipileService $unipileService, ApexLinkedInAccount $linkedInAccount, ApexCampaign $campaign): void
    {
        $filters = $this->buildSearchFilters($campaign);

        if (empty($filters)) {
            Log::info("No targeting criteria for campaign {$campaign->id}, skipping discovery.");

            return;
        }

        $limit = min($campaign->daily_connection_limit, 25);

        $results = $unipileService->searchProfiles(
            $linkedInAccount->unipile_account_id,
            $filters,
            $limit
        );

        $discovered = 0;
        $user = $campaign->user;

        foreach ($results as $profile) {
            $profileId = $profile['provider_id'] ?? $profile['id'] ?? null;
            $profileUrl = $profile['public_profile_url'] ?? $profile['profile_url'] ?? $profile['linkedin_url'] ?? null;

            if (! $profileId && ! $profileUrl) {
                continue;
            }

            $fullName = $profile['name'] ?? null;
            $firstName = $profile['first_name'] ?? null;
            $lastName = $profile['last_name'] ?? null;

            if (! $firstName && $fullName) {
                $parts = explode(' ', $fullName, 2);
                $firstName = $parts[0] ?? null;
                $lastName = $parts[1] ?? null;
            }

            $prospect = ApexProspect::query()
                ->where('user_id', $user->id)
                ->where('linkedin_profile_id', $profileId)
                ->first();

            if (! $prospect) {
                $prospect = ApexProspect::create([
                    'user_id' => $user->id,
                    'linkedin_profile_id' => $profileId,
                    'linkedin_profile_url' => $profileUrl,
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'full_name' => $fullName ?: trim(($firstName ?? '').' '.($lastName ?? '')) ?: null,
                    'headline' => $profile['headline'] ?? null,
                    'company' => $profile['company'] ?? $profile['current_company'] ?? null,
                    'job_title' => $profile['job_title'] ?? $profile['occupation'] ?? null,
                    'location' => $profile['location'] ?? null,
                    'avatar_url' => $profile['profile_picture_url'] ?? $profile['avatar_url'] ?? null,
                    'connection_status' => 'none',
                    'source' => 'linkedin_search',
                    'metadata' => ['campaign_id' => $campaign->id],
                ]);
            }

            $exists = ApexCampaignProspect::query()
                ->where('campaign_id', $campaign->id)
                ->where('prospect_id', $prospect->id)
                ->exists();

            if ($exists) {
                continue;
            }

            ApexCampaignProspect::create([
                'campaign_id' => $campaign->id,
                'prospect_id' => $prospect->id,
                'status' => 'queued',
                'follow_up_count' => 0,
                'metadata' => [],
            ]);

            $discovered++;
        }

        if ($discovered > 0) {
            ApexActivityLog::log(
                $user,
                'prospects_discovered',
                "Discovered {$discovered} new prospects for campaign \"{$campaign->name}\"",
                $campaign,
                null,
                ['count' => $discovered, 'filters' => $filters]
            );
        }

        Log::info("Pipeline: Discovery for campaign {$campaign->id} completed. Found {$discovered} new prospects from {$results->count()} results.");
    }

    /**
     * Build search filters for the Unipile LinkedIn search API.
     *
     * @return array<string, mixed>
     */
    private function buildSearchFilters(ApexCampaign $campaign): array
    {
        $jobTitles = $this->filterMeaningfulValues($campaign->job_titles);
        $locations = $this->filterMeaningfulValues($campaign->locations);
        $industries = $this->filterMeaningfulValues($campaign->industries);
        $keywords = $this->filterMeaningfulValues($campaign->keywords);

        $searchParts = [];

        if (! empty($jobTitles)) {
            $searchParts[] = implode(' OR ', $jobTitles);
        }

        if (! empty($keywords)) {
            $searchParts = array_merge($searchParts, $keywords);
        }

        if (! empty($industries)) {
            $searchParts = array_merge($searchParts, $industries);
        }

        if (! empty($locations)) {
            $searchParts = array_merge($searchParts, $locations);
        }

        if (empty($searchParts)) {
            return [];
        }

        return [
            'keywords' => implode(' ', $searchParts),
        ];
    }

    /**
     * Filter out non-meaningful placeholder values the AI may store.
     *
     * @param  list<string>|null  $values
     * @return list<string>
     */
    private function filterMeaningfulValues(?array $values): array
    {
        if (empty($values)) {
            return [];
        }

        $placeholders = [
            'open', 'any', 'all', 'none', 'n/a', 'na', 'not_important',
            'not important', 'no preference', 'no_preference', 'global',
            'anywhere', 'skip', 'skipped', 'declined',
        ];

        return array_values(array_filter(
            $values,
            fn (string $v) => ! in_array(strtolower(trim($v)), $placeholders)
        ));
    }
}
