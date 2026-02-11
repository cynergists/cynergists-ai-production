<?php

namespace App\Jobs\Apex;

use App\Models\ApexActivityLog;
use App\Models\ApexCampaign;
use App\Models\ApexCampaignProspect;
use App\Models\ApexLinkedInAccount;
use App\Models\ApexPendingAction;
use App\Models\ApexProspect;
use App\Models\ApexUserSettings;
use App\Models\PortalAvailableAgent;
use App\Models\User;
use App\Services\Apex\UnipileService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class RunCampaignPipelineJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $backoff = 60;

    public int $timeout = 300;

    public function __construct(
        public ApexCampaign $campaign,
        public PortalAvailableAgent $agent
    ) {}

    public function handle(UnipileService $unipileService): void
    {
        $campaign = $this->campaign->fresh();

        if ($campaign->status !== 'active') {
            Log::info("Campaign {$campaign->id} is no longer active, skipping pipeline.");

            return;
        }

        $user = $campaign->user;

        $linkedInAccount = ApexLinkedInAccount::query()
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->first();

        if (! $linkedInAccount) {
            Log::warning("No active LinkedIn account for user {$user->id}, skipping campaign {$campaign->id}");

            return;
        }

        $unipileService->forAgent($this->agent);

        if (! $unipileService->isConfigured()) {
            Log::warning("UnipileService not configured for agent {$this->agent->id}");

            return;
        }

        $settings = ApexUserSettings::forUser($user);

        // Step 0: Sync LinkedIn messages to detect replies and accepted connections
        $this->syncLinkedInMessages($unipileService, $linkedInAccount, $user);

        // Refresh campaign after sync in case status changed
        $campaign = $campaign->fresh();

        if ($campaign->status !== 'active') {
            return;
        }

        // Step 1: Discover new prospects
        $this->discoverProspects($unipileService, $linkedInAccount, $campaign);

        // Refresh campaign in case discovery changed things
        $campaign = $campaign->fresh();

        if ($campaign->status !== 'active') {
            return;
        }

        // Step 2: Send connection requests
        $this->sendConnections($unipileService, $linkedInAccount, $campaign, $settings);

        // Step 3: Process follow-ups
        $this->processFollowUps($unipileService, $linkedInAccount, $campaign, $settings);

        // Step 4: Check if campaign is done
        $campaign->fresh()->autoCompleteIfDone();
    }

    // ─── Step 0: Sync LinkedIn Messages ───────────────────────────────

    private function syncLinkedInMessages(
        UnipileService $unipileService,
        ApexLinkedInAccount $linkedInAccount,
        User $user
    ): void {
        // Get recent chats
        $chats = $unipileService->getChats($linkedInAccount->unipile_account_id, 50);

        $repliesProcessed = 0;
        $connectionsAccepted = 0;

        foreach ($chats as $chat) {
            $this->processChat($unipileService, $linkedInAccount, $user, $chat, $repliesProcessed, $connectionsAccepted);
        }

        // Update the account's last sync time
        $linkedInAccount->update(['last_synced_at' => now()]);

        if ($repliesProcessed > 0 || $connectionsAccepted > 0) {
            Log::info("LinkedIn sync completed for user {$user->id}. Replies: {$repliesProcessed}, Connections accepted: {$connectionsAccepted}");
        }
    }

    private function processChat(
        UnipileService $unipileService,
        ApexLinkedInAccount $linkedInAccount,
        User $user,
        array $chat,
        int &$repliesProcessed,
        int &$connectionsAccepted
    ): void {
        $chatId = $chat['id'] ?? null;
        if (! $chatId) {
            return;
        }

        // Find the prospect from chat attendees
        $attendees = $chat['attendees'] ?? [];
        $prospect = null;

        foreach ($attendees as $attendee) {
            $providerId = $attendee['provider_id'] ?? null;
            if ($providerId && $providerId !== $linkedInAccount->linkedin_profile_id) {
                $prospect = ApexProspect::query()
                    ->where('user_id', $user->id)
                    ->where('linkedin_profile_id', $providerId)
                    ->first();

                if ($prospect) {
                    break;
                }
            }
        }

        if (! $prospect) {
            // Not a tracked prospect
            return;
        }

        // Check if this is a newly accepted connection (they replied for first time)
        if ($prospect->connection_status === 'pending') {
            $prospect->update(['connection_status' => 'connected']);
            $connectionsAccepted++;

            // Update all campaign-prospect records
            $prospect->campaignProspects()
                ->where('status', 'connection_sent')
                ->update([
                    'status' => 'connection_accepted',
                    'connection_accepted_at' => now(),
                    'next_follow_up_at' => now()->addDays(3), // Schedule first follow-up
                ]);

            // Update campaign stats
            $campaigns = ApexCampaign::query()
                ->whereHas('campaignProspects', fn ($q) => $q->where('prospect_id', $prospect->id))
                ->get();

            foreach ($campaigns as $campaign) {
                $campaign->increment('connections_accepted');
            }

            ApexActivityLog::log(
                $user,
                'connection_accepted',
                "Connection accepted by {$prospect->display_name}",
                null,
                $prospect
            );
        }

        // Get recent messages to check for replies
        $messages = $unipileService->getChatMessages($chatId, 10);

        foreach ($messages as $message) {
            $this->processMessage($prospect, $user, $message, $repliesProcessed);
        }
    }

    private function processMessage(
        ApexProspect $prospect,
        User $user,
        array $message,
        int &$repliesProcessed
    ): void {
        $senderId = $message['sender_id'] ?? null;
        $messageTime = $message['timestamp'] ?? null;

        // Skip if message is from us (not a reply)
        if ($senderId === $prospect->linkedin_profile_id) {
            return;
        }

        // Check if this is a recent message we haven't processed
        $lastReplyAt = $prospect->campaignProspects()
            ->max('last_reply_at');

        if ($messageTime && $lastReplyAt) {
            $messageDateTime = \Carbon\Carbon::parse($messageTime);
            $lastReplyDateTime = \Carbon\Carbon::parse($lastReplyAt);

            if ($messageDateTime->lte($lastReplyDateTime)) {
                // Already processed this message
                return;
            }
        }

        // Update campaign-prospect records
        $prospect->campaignProspects()
            ->whereIn('status', ['connection_accepted', 'message_sent'])
            ->update([
                'status' => 'replied',
                'last_reply_at' => now(),
                'next_follow_up_at' => null, // Stop follow-ups when they reply
            ]);

        // Update campaign stats
        $campaigns = ApexCampaign::query()
            ->whereHas('campaignProspects', fn ($q) => $q->where('prospect_id', $prospect->id))
            ->get();

        foreach ($campaigns as $campaign) {
            $campaign->increment('replies_received');
        }

        $repliesProcessed++;

        ApexActivityLog::log(
            $user,
            'reply_received',
            "Reply received from {$prospect->display_name}",
            null,
            $prospect,
            ['message_preview' => substr($message['text'] ?? '', 0, 100)]
        );
    }

    // ─── Step 1: Discover Prospects ───────────────────────────────────

    private function discoverProspects(
        UnipileService $unipileService,
        ApexLinkedInAccount $linkedInAccount,
        ApexCampaign $campaign
    ): void {
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

    // ─── Step 2: Send Connections ─────────────────────────────────────

    private function sendConnections(
        UnipileService $unipileService,
        ApexLinkedInAccount $linkedInAccount,
        ApexCampaign $campaign,
        ApexUserSettings $settings
    ): void {
        $queuedProspects = ApexCampaignProspect::query()
            ->where('campaign_id', $campaign->id)
            ->where('status', 'queued')
            ->with('prospect')
            ->limit($campaign->daily_connection_limit)
            ->get();

        $connectionsSentToday = ApexCampaignProspect::query()
            ->where('campaign_id', $campaign->id)
            ->whereDate('connection_sent_at', today())
            ->count();

        foreach ($queuedProspects as $campaignProspect) {
            if ($connectionsSentToday >= $campaign->daily_connection_limit) {
                Log::info("Daily connection limit reached for campaign {$campaign->id}");
                break;
            }

            $prospect = $campaignProspect->prospect;

            if (! $prospect->linkedin_profile_id) {
                Log::warning("Prospect {$prospect->id} has no LinkedIn profile ID, marking as failed");
                $campaignProspect->update(['status' => 'failed']);

                continue;
            }

            if ($settings->autopilot_enabled) {
                $success = $unipileService->sendConnectionRequest(
                    $linkedInAccount->unipile_account_id,
                    $prospect->linkedin_profile_id,
                    $campaign->connection_message
                );

                if ($success) {
                    $campaignProspect->update([
                        'status' => 'connection_sent',
                        'connection_sent_at' => now(),
                    ]);

                    $prospect->update(['connection_status' => 'pending']);
                    $campaign->increment('connections_sent');

                    ApexActivityLog::log(
                        $campaign->user,
                        'connection_sent',
                        "Connection request sent to {$prospect->display_name}",
                        $campaign,
                        $prospect
                    );

                    $connectionsSentToday++;
                } else {
                    $campaignProspect->update(['status' => 'failed']);
                    Log::warning("Failed to send connection to prospect {$prospect->id}, marked as failed");
                }
            } else {
                ApexPendingAction::create([
                    'user_id' => $campaign->user_id,
                    'campaign_id' => $campaign->id,
                    'prospect_id' => $campaignProspect->prospect_id,
                    'action_type' => 'send_connection',
                    'status' => 'pending',
                    'message_content' => $campaign->connection_message,
                    'expires_at' => now()->addDays(7),
                    'metadata' => [
                        'campaign_name' => $campaign->name,
                        'prospect_name' => $campaignProspect->prospect->display_name,
                    ],
                ]);
            }
        }

        Log::info("Pipeline: Connections for campaign {$campaign->id} completed. Processed {$queuedProspects->count()} prospects.");
    }

    // ─── Step 3: Process Follow-Ups ───────────────────────────────────

    private function processFollowUps(
        UnipileService $unipileService,
        ApexLinkedInAccount $linkedInAccount,
        ApexCampaign $campaign,
        ApexUserSettings $settings
    ): void {
        $prospectsForFollowUp = ApexCampaignProspect::query()
            ->where('campaign_id', $campaign->id)
            ->readyForFollowUp()
            ->with('prospect')
            ->limit($campaign->daily_message_limit)
            ->get();

        $messagesSentToday = ApexCampaignProspect::query()
            ->where('campaign_id', $campaign->id)
            ->whereDate('last_message_sent_at', today())
            ->count();

        foreach ($prospectsForFollowUp as $campaignProspect) {
            if ($messagesSentToday >= $campaign->daily_message_limit) {
                Log::info("Daily message limit reached for campaign {$campaign->id}");
                break;
            }

            $followUpMessage = $this->getFollowUpMessage($campaign, $campaignProspect);

            if (! $followUpMessage) {
                $campaignProspect->update(['next_follow_up_at' => null]);

                continue;
            }

            if ($settings->autopilot_enabled) {
                $this->sendFollowUp(
                    $unipileService,
                    $linkedInAccount,
                    $campaignProspect,
                    $campaign,
                    $followUpMessage
                );
                $messagesSentToday++;
            } else {
                ApexPendingAction::create([
                    'user_id' => $campaign->user_id,
                    'campaign_id' => $campaign->id,
                    'prospect_id' => $campaignProspect->prospect_id,
                    'action_type' => 'send_follow_up',
                    'status' => 'pending',
                    'message_content' => $followUpMessage,
                    'expires_at' => now()->addDays(7),
                    'metadata' => [
                        'campaign_name' => $campaign->name,
                        'prospect_name' => $campaignProspect->prospect->display_name,
                        'follow_up_number' => $campaignProspect->follow_up_count + 1,
                    ],
                ]);
            }
        }

        Log::info("Pipeline: Follow-ups for campaign {$campaign->id} completed. Processed {$prospectsForFollowUp->count()} prospects.");
    }

    // ─── Helper Methods ───────────────────────────────────────────────

    private function getFollowUpMessage(ApexCampaign $campaign, ApexCampaignProspect $campaignProspect): ?string
    {
        return match ($campaignProspect->follow_up_count) {
            0 => $campaign->follow_up_message_1,
            1 => $campaign->follow_up_message_2,
            2 => $campaign->follow_up_message_3,
            default => null,
        };
    }

    private function getNextFollowUpDelay(ApexCampaign $campaign, int $currentCount): ?int
    {
        return match ($currentCount + 1) {
            1 => $campaign->follow_up_delay_days_2,
            2 => $campaign->follow_up_delay_days_3,
            default => null,
        };
    }

    private function sendFollowUp(
        UnipileService $unipileService,
        ApexLinkedInAccount $linkedInAccount,
        ApexCampaignProspect $campaignProspect,
        ApexCampaign $campaign,
        string $message
    ): void {
        $prospect = $campaignProspect->prospect;

        $chatId = $this->findOrCreateChat(
            $unipileService,
            $linkedInAccount,
            $prospect->linkedin_profile_id,
            $message
        );

        if (! $chatId) {
            Log::warning("Failed to find or create chat for prospect {$prospect->id}");

            return;
        }

        $success = $unipileService->sendMessage($chatId, $message);

        if ($success) {
            $newFollowUpCount = $campaignProspect->follow_up_count + 1;
            $nextDelay = $this->getNextFollowUpDelay($campaign, $campaignProspect->follow_up_count);

            $campaignProspect->update([
                'status' => 'message_sent',
                'last_message_sent_at' => now(),
                'follow_up_count' => $newFollowUpCount,
                'next_follow_up_at' => $nextDelay ? now()->addDays($nextDelay) : null,
            ]);

            $campaign->increment('messages_sent');

            ApexActivityLog::log(
                $campaign->user,
                'follow_up_sent',
                "Follow-up #{$newFollowUpCount} sent to {$prospect->display_name}",
                $campaign,
                $prospect
            );
        } else {
            Log::warning("Failed to send follow-up to prospect {$prospect->id}");
        }
    }

    private function findOrCreateChat(
        UnipileService $unipileService,
        ApexLinkedInAccount $linkedInAccount,
        ?string $profileId,
        string $message
    ): ?string {
        if (! $profileId) {
            return null;
        }

        $chats = $unipileService->getChats($linkedInAccount->unipile_account_id, 50);

        foreach ($chats as $chat) {
            $attendees = $chat['attendees'] ?? [];
            foreach ($attendees as $attendee) {
                if (($attendee['provider_id'] ?? '') === $profileId) {
                    return $chat['id'] ?? null;
                }
            }
        }

        return $unipileService->startChat(
            $linkedInAccount->unipile_account_id,
            $profileId,
            $message
        );
    }

    /**
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
