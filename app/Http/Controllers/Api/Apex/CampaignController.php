<?php

namespace App\Http\Controllers\Api\Apex;

use App\Http\Controllers\Controller;
use App\Models\ApexActivityLog;
use App\Models\ApexCampaign;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CampaignController extends Controller
{
    /**
     * List all campaigns for the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $campaigns = ApexCampaign::query()
            ->where('user_id', $request->user()->id)
            ->withCount(['campaignProspects', 'pendingActions' => fn ($q) => $q->where('status', 'pending')])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['campaigns' => $campaigns]);
    }

    /**
     * Create a new campaign.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'campaign_type' => ['required', Rule::in(['connection', 'message', 'follow_up'])],
            'job_titles' => ['nullable', 'array'],
            'job_titles.*' => ['string', 'max:255'],
            'locations' => ['nullable', 'array'],
            'locations.*' => ['string', 'max:255'],
            'keywords' => ['nullable', 'array'],
            'keywords.*' => ['string', 'max:255'],
            'industries' => ['nullable', 'array'],
            'industries.*' => ['string', 'max:255'],
            'connection_message' => ['nullable', 'string', 'max:2000'],
            'follow_up_message_1' => ['nullable', 'string', 'max:2000'],
            'follow_up_message_2' => ['nullable', 'string', 'max:2000'],
            'follow_up_message_3' => ['nullable', 'string', 'max:2000'],
            'follow_up_delay_days_1' => ['nullable', 'integer', 'min:1', 'max:30'],
            'follow_up_delay_days_2' => ['nullable', 'integer', 'min:1', 'max:30'],
            'follow_up_delay_days_3' => ['nullable', 'integer', 'min:1', 'max:30'],
            'booking_method' => ['nullable', Rule::in(['calendar', 'phone', 'manual'])],
            'calendar_link' => ['nullable', 'url', 'max:500'],
            'phone_number' => ['nullable', 'string', 'max:50'],
            'daily_connection_limit' => ['nullable', 'integer', 'min:1', 'max:100'],
            'daily_message_limit' => ['nullable', 'integer', 'min:1', 'max:200'],
        ]);

        $campaign = ApexCampaign::create([
            ...$validated,
            'user_id' => $request->user()->id,
            'status' => 'draft',
        ]);

        ApexActivityLog::log(
            $request->user(),
            'campaign_created',
            "Campaign created: {$campaign->name}",
            $campaign
        );

        return response()->json([
            'campaign' => $campaign,
            'message' => 'Campaign created successfully.',
        ], 201);
    }

    /**
     * Get a single campaign.
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $campaign = ApexCampaign::query()
            ->where('user_id', $request->user()->id)
            ->where('id', $id)
            ->withCount(['campaignProspects', 'pendingActions' => fn ($q) => $q->where('status', 'pending')])
            ->with(['campaignProspects' => fn ($q) => $q->with('prospect')->limit(100)])
            ->firstOrFail();

        return response()->json(['campaign' => $campaign]);
    }

    /**
     * Update a campaign.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $campaign = ApexCampaign::query()
            ->where('user_id', $request->user()->id)
            ->where('id', $id)
            ->firstOrFail();

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'campaign_type' => ['sometimes', 'required', Rule::in(['connection', 'message', 'follow_up'])],
            'job_titles' => ['nullable', 'array'],
            'job_titles.*' => ['string', 'max:255'],
            'locations' => ['nullable', 'array'],
            'locations.*' => ['string', 'max:255'],
            'keywords' => ['nullable', 'array'],
            'keywords.*' => ['string', 'max:255'],
            'industries' => ['nullable', 'array'],
            'industries.*' => ['string', 'max:255'],
            'connection_message' => ['nullable', 'string', 'max:2000'],
            'follow_up_message_1' => ['nullable', 'string', 'max:2000'],
            'follow_up_message_2' => ['nullable', 'string', 'max:2000'],
            'follow_up_message_3' => ['nullable', 'string', 'max:2000'],
            'follow_up_delay_days_1' => ['nullable', 'integer', 'min:1', 'max:30'],
            'follow_up_delay_days_2' => ['nullable', 'integer', 'min:1', 'max:30'],
            'follow_up_delay_days_3' => ['nullable', 'integer', 'min:1', 'max:30'],
            'booking_method' => ['nullable', Rule::in(['calendar', 'phone', 'manual'])],
            'calendar_link' => ['nullable', 'url', 'max:500'],
            'phone_number' => ['nullable', 'string', 'max:50'],
            'daily_connection_limit' => ['nullable', 'integer', 'min:1', 'max:100'],
            'daily_message_limit' => ['nullable', 'integer', 'min:1', 'max:200'],
        ]);

        $campaign->update($validated);

        return response()->json([
            'campaign' => $campaign->fresh(),
            'message' => 'Campaign updated successfully.',
        ]);
    }

    /**
     * Delete a campaign.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $campaign = ApexCampaign::query()
            ->where('user_id', $request->user()->id)
            ->where('id', $id)
            ->firstOrFail();

        $campaignName = $campaign->name;
        $campaign->delete();

        ApexActivityLog::log(
            $request->user(),
            'campaign_deleted',
            "Campaign deleted: {$campaignName}"
        );

        return response()->json([
            'message' => 'Campaign deleted successfully.',
        ]);
    }

    /**
     * Start a campaign.
     */
    public function start(Request $request, string $id): JsonResponse
    {
        $campaign = ApexCampaign::query()
            ->where('user_id', $request->user()->id)
            ->where('id', $id)
            ->firstOrFail();

        if (! in_array($campaign->status, ['draft', 'paused'])) {
            return response()->json([
                'error' => 'Campaign cannot be started. It must be in draft or paused status.',
            ], 422);
        }

        $campaign->update([
            'status' => 'active',
            'started_at' => $campaign->started_at ?? now(),
            'paused_at' => null,
        ]);

        ApexActivityLog::log(
            $request->user(),
            'campaign_started',
            "Campaign started: {$campaign->name}",
            $campaign
        );

        return response()->json([
            'campaign' => $campaign->fresh(),
            'message' => 'Campaign started successfully.',
        ]);
    }

    /**
     * Pause a campaign.
     */
    public function pause(Request $request, string $id): JsonResponse
    {
        $campaign = ApexCampaign::query()
            ->where('user_id', $request->user()->id)
            ->where('id', $id)
            ->firstOrFail();

        if ($campaign->status !== 'active') {
            return response()->json([
                'error' => 'Only active campaigns can be paused.',
            ], 422);
        }

        $campaign->update([
            'status' => 'paused',
            'paused_at' => now(),
        ]);

        ApexActivityLog::log(
            $request->user(),
            'campaign_paused',
            "Campaign paused: {$campaign->name}",
            $campaign
        );

        return response()->json([
            'campaign' => $campaign->fresh(),
            'message' => 'Campaign paused successfully.',
        ]);
    }

    /**
     * Complete a campaign.
     */
    public function complete(Request $request, string $id): JsonResponse
    {
        $campaign = ApexCampaign::query()
            ->where('user_id', $request->user()->id)
            ->where('id', $id)
            ->firstOrFail();

        if (! in_array($campaign->status, ['active', 'paused'])) {
            return response()->json([
                'error' => 'Only active or paused campaigns can be completed.',
            ], 422);
        }

        $campaign->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        ApexActivityLog::log(
            $request->user(),
            'campaign_completed',
            "Campaign completed: {$campaign->name}",
            $campaign
        );

        return response()->json([
            'campaign' => $campaign->fresh(),
            'message' => 'Campaign marked as completed.',
        ]);
    }

    /**
     * Get campaign statistics.
     */
    public function stats(Request $request, string $id): JsonResponse
    {
        $campaign = ApexCampaign::query()
            ->where('user_id', $request->user()->id)
            ->where('id', $id)
            ->withCount([
                'campaignProspects',
                'campaignProspects as queued_count' => fn ($q) => $q->where('status', 'queued'),
                'campaignProspects as connection_sent_count' => fn ($q) => $q->where('status', 'connection_sent'),
                'campaignProspects as connected_count' => fn ($q) => $q->where('status', 'connection_accepted'),
                'campaignProspects as replied_count' => fn ($q) => $q->where('status', 'replied'),
                'campaignProspects as meeting_count' => fn ($q) => $q->where('status', 'meeting_scheduled'),
            ])
            ->firstOrFail();

        return response()->json([
            'stats' => [
                'total_prospects' => $campaign->campaign_prospects_count,
                'queued' => $campaign->queued_count,
                'connection_sent' => $campaign->connection_sent_count,
                'connected' => $campaign->connected_count,
                'replied' => $campaign->replied_count,
                'meetings_scheduled' => $campaign->meeting_count,
                'connections_sent' => $campaign->connections_sent,
                'connections_accepted' => $campaign->connections_accepted,
                'messages_sent' => $campaign->messages_sent,
                'replies_received' => $campaign->replies_received,
                'meetings_booked' => $campaign->meetings_booked,
                'acceptance_rate' => $campaign->acceptance_rate,
                'reply_rate' => $campaign->reply_rate,
            ],
        ]);
    }
}
