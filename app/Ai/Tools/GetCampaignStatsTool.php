<?php

namespace App\Ai\Tools;

use App\Models\ApexCampaign;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;

class GetCampaignStatsTool implements Tool
{
    public function __construct(
        public User $user
    ) {}

    /**
     * Get the description of the tool's purpose.
     */
    public function description(): string
    {
        return 'Get detailed statistics for a specific LinkedIn outreach campaign. Use this when the user asks for details on a particular campaign.';
    }

    /**
     * Execute the tool.
     */
    public function handle(Request $request): string
    {
        $campaignId = $request['campaign_id'];

        $campaign = ApexCampaign::query()
            ->where('id', $campaignId)
            ->where('user_id', $this->user->id)
            ->first();

        if (! $campaign) {
            return 'Campaign not found. Please provide a valid campaign ID from the campaigns list.';
        }

        $status = ucfirst($campaign->status);
        $jobTitles = is_array($campaign->job_titles) ? implode(', ', $campaign->job_titles) : 'Not set';
        $locations = is_array($campaign->locations) ? implode(', ', $campaign->locations) : 'Not set';
        $industries = is_array($campaign->industries) ? implode(', ', $campaign->industries) : 'Not set';

        $result = "Campaign: {$campaign->name}\n";
        $result .= "Status: {$status}\n";
        $result .= "Type: {$campaign->campaign_type}\n\n";

        $result .= "TARGETING:\n";
        $result .= "  Job Titles: {$jobTitles}\n";
        $result .= "  Locations: {$locations}\n";
        $result .= "  Industries: {$industries}\n\n";

        $result .= "PERFORMANCE:\n";
        $result .= "  Connections Sent: {$campaign->connections_sent}\n";
        $result .= "  Connections Accepted: {$campaign->connections_accepted}";
        if ($campaign->connections_sent > 0) {
            $result .= " ({$campaign->acceptance_rate}% rate)";
        }
        $result .= "\n";
        $result .= "  Messages Sent: {$campaign->messages_sent}\n";
        $result .= "  Replies Received: {$campaign->replies_received}";
        if ($campaign->messages_sent > 0) {
            $result .= " ({$campaign->reply_rate}% rate)";
        }
        $result .= "\n";
        $result .= "  Meetings Booked: {$campaign->meetings_booked}\n\n";

        $result .= "LIMITS:\n";
        $result .= "  Daily connections: {$campaign->daily_connection_limit}\n";
        $result .= "  Daily messages: {$campaign->daily_message_limit}\n";

        if ($campaign->started_at) {
            $result .= "\nStarted: {$campaign->started_at->diffForHumans()}";
        }

        if ($campaign->paused_at) {
            $result .= "\nPaused: {$campaign->paused_at->diffForHumans()}";
        }

        return $result;
    }

    /**
     * Get the tool's schema definition.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'campaign_id' => $schema
                ->string()
                ->description('The UUID of the campaign to get stats for. Use the campaign IDs from the campaigns list.')
                ->required(),
        ];
    }
}
