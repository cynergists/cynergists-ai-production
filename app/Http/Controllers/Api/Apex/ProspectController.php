<?php

namespace App\Http\Controllers\Api\Apex;

use App\Http\Controllers\Controller;
use App\Models\ApexCampaign;
use App\Models\ApexCampaignProspect;
use App\Models\ApexProspect;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProspectController extends Controller
{
    /**
     * List all prospects for the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $query = ApexProspect::query()
            ->where('user_id', $request->user()->id)
            ->withCount('campaigns');

        // Filter by connection status
        if ($request->has('connection_status')) {
            $query->where('connection_status', $request->connection_status);
        }

        // Filter by source
        if ($request->has('source')) {
            $query->where('source', $request->source);
        }

        // Search by name or company
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                    ->orWhere('company', 'like', "%{$search}%")
                    ->orWhere('job_title', 'like', "%{$search}%");
            });
        }

        $prospects = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 25));

        return response()->json($prospects);
    }

    /**
     * Create a new prospect.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'linkedin_profile_id' => ['nullable', 'string', 'max:255'],
            'linkedin_profile_url' => ['nullable', 'url', 'max:500'],
            'first_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['nullable', 'string', 'max:255'],
            'full_name' => ['nullable', 'string', 'max:500'],
            'headline' => ['nullable', 'string', 'max:500'],
            'company' => ['nullable', 'string', 'max:255'],
            'job_title' => ['nullable', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'avatar_url' => ['nullable', 'url', 'max:500'],
            'source' => ['nullable', 'string', 'max:50'],
            'metadata' => ['nullable', 'array'],
        ]);

        // Check for existing prospect with same LinkedIn profile
        if (! empty($validated['linkedin_profile_id'])) {
            $existing = ApexProspect::query()
                ->where('user_id', $request->user()->id)
                ->where('linkedin_profile_id', $validated['linkedin_profile_id'])
                ->first();

            if ($existing) {
                return response()->json([
                    'error' => 'A prospect with this LinkedIn profile already exists.',
                    'prospect' => $existing,
                ], 422);
            }
        }

        $prospect = ApexProspect::create([
            ...$validated,
            'user_id' => $request->user()->id,
            'source' => $validated['source'] ?? 'manual',
            'connection_status' => 'none',
        ]);

        return response()->json([
            'prospect' => $prospect,
            'message' => 'Prospect created successfully.',
        ], 201);
    }

    /**
     * Bulk create prospects (e.g., from Apify import).
     */
    public function bulkStore(Request $request): JsonResponse
    {
        $request->validate([
            'prospects' => ['required', 'array', 'max:500'],
            'prospects.*.linkedin_profile_id' => ['nullable', 'string', 'max:255'],
            'prospects.*.linkedin_profile_url' => ['nullable', 'url', 'max:500'],
            'prospects.*.first_name' => ['nullable', 'string', 'max:255'],
            'prospects.*.last_name' => ['nullable', 'string', 'max:255'],
            'prospects.*.full_name' => ['nullable', 'string', 'max:500'],
            'prospects.*.headline' => ['nullable', 'string', 'max:500'],
            'prospects.*.company' => ['nullable', 'string', 'max:255'],
            'prospects.*.job_title' => ['nullable', 'string', 'max:255'],
            'prospects.*.location' => ['nullable', 'string', 'max:255'],
            'prospects.*.email' => ['nullable', 'email', 'max:255'],
            'prospects.*.phone' => ['nullable', 'string', 'max:50'],
            'prospects.*.avatar_url' => ['nullable', 'url', 'max:500'],
            'prospects.*.metadata' => ['nullable', 'array'],
            'source' => ['nullable', 'string', 'max:50'],
            'campaign_id' => ['nullable', 'string', 'exists:apex_campaigns,id'],
        ]);

        $userId = $request->user()->id;
        $source = $request->source ?? 'bulk_import';
        $created = 0;
        $skipped = 0;
        $createdProspects = [];

        foreach ($request->prospects as $prospectData) {
            // Check for duplicate
            if (! empty($prospectData['linkedin_profile_id'])) {
                $exists = ApexProspect::query()
                    ->where('user_id', $userId)
                    ->where('linkedin_profile_id', $prospectData['linkedin_profile_id'])
                    ->exists();

                if ($exists) {
                    $skipped++;

                    continue;
                }
            }

            $prospect = ApexProspect::create([
                'user_id' => $userId,
                'linkedin_profile_id' => $prospectData['linkedin_profile_id'] ?? null,
                'linkedin_profile_url' => $prospectData['linkedin_profile_url'] ?? null,
                'first_name' => $prospectData['first_name'] ?? null,
                'last_name' => $prospectData['last_name'] ?? null,
                'full_name' => $prospectData['full_name'] ?? null,
                'headline' => $prospectData['headline'] ?? null,
                'company' => $prospectData['company'] ?? null,
                'job_title' => $prospectData['job_title'] ?? null,
                'location' => $prospectData['location'] ?? null,
                'email' => $prospectData['email'] ?? null,
                'phone' => $prospectData['phone'] ?? null,
                'avatar_url' => $prospectData['avatar_url'] ?? null,
                'source' => $source,
                'connection_status' => 'none',
                'metadata' => $prospectData['metadata'] ?? null,
            ]);

            $createdProspects[] = $prospect;
            $created++;
        }

        // If a campaign ID was provided, attach all created prospects to it
        if ($request->campaign_id && count($createdProspects) > 0) {
            $campaign = ApexCampaign::query()
                ->where('user_id', $userId)
                ->where('id', $request->campaign_id)
                ->first();

            if ($campaign) {
                foreach ($createdProspects as $prospect) {
                    ApexCampaignProspect::create([
                        'campaign_id' => $campaign->id,
                        'prospect_id' => $prospect->id,
                        'status' => 'queued',
                    ]);
                }
            }
        }

        return response()->json([
            'created' => $created,
            'skipped' => $skipped,
            'message' => "Created {$created} prospects, skipped {$skipped} duplicates.",
        ], 201);
    }

    /**
     * Get a single prospect.
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $prospect = ApexProspect::query()
            ->where('user_id', $request->user()->id)
            ->where('id', $id)
            ->with(['campaigns', 'pendingActions' => fn ($q) => $q->where('status', 'pending')])
            ->firstOrFail();

        return response()->json(['prospect' => $prospect]);
    }

    /**
     * Update a prospect.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $prospect = ApexProspect::query()
            ->where('user_id', $request->user()->id)
            ->where('id', $id)
            ->firstOrFail();

        $validated = $request->validate([
            'linkedin_profile_id' => ['nullable', 'string', 'max:255'],
            'linkedin_profile_url' => ['nullable', 'url', 'max:500'],
            'first_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['nullable', 'string', 'max:255'],
            'full_name' => ['nullable', 'string', 'max:500'],
            'headline' => ['nullable', 'string', 'max:500'],
            'company' => ['nullable', 'string', 'max:255'],
            'job_title' => ['nullable', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'avatar_url' => ['nullable', 'url', 'max:500'],
            'connection_status' => ['nullable', Rule::in(['none', 'pending', 'connected', 'rejected'])],
            'metadata' => ['nullable', 'array'],
        ]);

        $prospect->update($validated);

        return response()->json([
            'prospect' => $prospect->fresh(),
            'message' => 'Prospect updated successfully.',
        ]);
    }

    /**
     * Delete a prospect.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $prospect = ApexProspect::query()
            ->where('user_id', $request->user()->id)
            ->where('id', $id)
            ->firstOrFail();

        $prospect->delete();

        return response()->json([
            'message' => 'Prospect deleted successfully.',
        ]);
    }

    /**
     * Add a prospect to a campaign.
     */
    public function addToCampaign(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'campaign_id' => ['required', 'string', 'exists:apex_campaigns,id'],
        ]);

        $prospect = ApexProspect::query()
            ->where('user_id', $request->user()->id)
            ->where('id', $id)
            ->firstOrFail();

        $campaign = ApexCampaign::query()
            ->where('user_id', $request->user()->id)
            ->where('id', $request->campaign_id)
            ->firstOrFail();

        // Check if already in campaign
        $exists = ApexCampaignProspect::query()
            ->where('campaign_id', $campaign->id)
            ->where('prospect_id', $prospect->id)
            ->exists();

        if ($exists) {
            return response()->json([
                'error' => 'Prospect is already in this campaign.',
            ], 422);
        }

        ApexCampaignProspect::create([
            'campaign_id' => $campaign->id,
            'prospect_id' => $prospect->id,
            'status' => 'queued',
        ]);

        return response()->json([
            'message' => 'Prospect added to campaign successfully.',
        ]);
    }

    /**
     * Remove a prospect from a campaign.
     */
    public function removeFromCampaign(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'campaign_id' => ['required', 'string', 'exists:apex_campaigns,id'],
        ]);

        $prospect = ApexProspect::query()
            ->where('user_id', $request->user()->id)
            ->where('id', $id)
            ->firstOrFail();

        ApexCampaignProspect::query()
            ->where('campaign_id', $request->campaign_id)
            ->where('prospect_id', $prospect->id)
            ->delete();

        return response()->json([
            'message' => 'Prospect removed from campaign successfully.',
        ]);
    }
}
