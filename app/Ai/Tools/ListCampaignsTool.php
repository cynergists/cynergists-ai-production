<?php

namespace App\Ai\Tools;

use App\Models\ApexCampaign;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;

class ListCampaignsTool implements Tool
{
    public function __construct(
        public User $user
    ) {}

    /**
     * Get the description of the tool's purpose.
     */
    public function description(): string
    {
        return "List the user's LinkedIn outreach campaigns with their current status and stats. Use this when the user asks to see their campaigns.";
    }

    /**
     * Execute the tool.
     */
    public function handle(Request $request): string
    {
        $query = ApexCampaign::query()
            ->where('user_id', $this->user->id)
            ->orderBy('updated_at', 'desc')
            ->limit(10);

        $statusFilter = $request['status_filter'] ?? null;

        if ($statusFilter) {
            $query->where('status', $statusFilter);
        }

        $campaigns = $query->get();

        if ($campaigns->isEmpty()) {
            return $statusFilter
                ? "No campaigns found with status \"{$statusFilter}\"."
                : 'No campaigns found. The user has not created any campaigns yet.';
        }

        $result = "Found {$campaigns->count()} campaign(s):\n";

        foreach ($campaigns as $campaign) {
            $status = ucfirst($campaign->status);
            $result .= "\n[{$campaign->id}] {$campaign->name} ({$status})";
            $result .= "\n  Connections: {$campaign->connections_sent} sent, {$campaign->connections_accepted} accepted";
            $result .= "\n  Messages: {$campaign->messages_sent} sent, {$campaign->replies_received} replies";
            $result .= "\n  Meetings booked: {$campaign->meetings_booked}";

            if ($campaign->connections_sent > 0) {
                $result .= "\n  Acceptance rate: {$campaign->acceptance_rate}%";
                $result .= "\n  Reply rate: {$campaign->reply_rate}%";
            }

            $result .= "\n";
        }

        return $result;
    }

    /**
     * Get the tool's schema definition.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'status_filter' => $schema
                ->string()
                ->description('Optional filter by campaign status: draft, active, paused, or completed.'),
        ];
    }
}
