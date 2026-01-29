<?php

namespace App\Services\Apex;

use App\Models\ApexCampaign;
use App\Models\ApexLinkedInAccount;
use App\Models\ApexPendingAction;
use App\Models\ApexProspect;
use App\Models\PortalAvailableAgent;
use App\Models\User;

class ApexAgentHandler
{
    public function __construct(
        private IntentParser $intentParser,
        private UnipileService $unipileService
    ) {}

    /**
     * Handle an incoming chat message and generate a response.
     */
    public function handle(string $message, User $user, PortalAvailableAgent $agent): string
    {
        // Parse the intent from the message
        $parsed = $this->intentParser->parse($message, $agent);
        $intent = $parsed['intent'];
        $entities = $parsed['entities'];

        // Route to the appropriate handler
        return match ($intent) {
            'list_campaigns' => $this->handleListCampaigns($user),
            'create_campaign' => $this->handleCreateCampaign($user, $entities),
            'campaign_stats' => $this->handleCampaignStats($user, $entities),
            'start_campaign' => $this->handleStartCampaign($user, $entities),
            'pause_campaign' => $this->handlePauseCampaign($user, $entities),
            'list_prospects' => $this->handleListProspects($user),
            'add_prospects' => $this->handleAddProspects($user, $entities),
            'connect_linkedin' => $this->handleConnectLinkedIn($user, $agent),
            'linkedin_status' => $this->handleLinkedInStatus($user),
            'pending_actions' => $this->handlePendingActions($user),
            'approve_actions' => $this->handleApproveActions($user, $entities),
            'deny_actions' => $this->handleDenyActions($user, $entities),
            'help' => $this->handleHelp(),
            'general_question' => $this->handleGeneralQuestion($message),
            default => $this->handleUnknown($message),
        };
    }

    /**
     * List user's campaigns.
     */
    private function handleListCampaigns(User $user): string
    {
        $campaigns = ApexCampaign::query()
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        if ($campaigns->isEmpty()) {
            return "You don't have any campaigns yet. Would you like me to help you create one? Just say something like \"Create a campaign targeting CTOs in Denver\".";
        }

        $campaignList = $campaigns->map(function ($campaign) {
            $status = ucfirst($campaign->status);
            $stats = "{$campaign->connections_sent} connections, {$campaign->replies_received} replies";

            return "• **{$campaign->name}** ({$status}) - {$stats}";
        })->implode("\n");

        return "Here are your campaigns:\n\n{$campaignList}\n\nWould you like to see detailed stats for any of these?";
    }

    /**
     * Help create a new campaign.
     */
    private function handleCreateCampaign(User $user, array $entities): string
    {
        $jobTitles = $entities['job_titles'] ?? [];
        $locations = $entities['locations'] ?? [];

        if (empty($jobTitles) && empty($locations)) {
            return "I'd be happy to help you create a new campaign! To get started, tell me:\n\n1. What job titles do you want to target? (e.g., CTOs, Marketing Directors)\n2. What locations? (e.g., Denver, New York)\n\nFor example: \"Create a campaign targeting CTOs and VPs of Sales in Denver and Austin\"";
        }

        // Provide guidance on what to do next
        $response = "Great! Here's what I understand:\n\n";

        if (! empty($jobTitles)) {
            $response .= '**Target Job Titles:** '.implode(', ', $jobTitles)."\n";
        }

        if (! empty($locations)) {
            $response .= '**Target Locations:** '.implode(', ', $locations)."\n";
        }

        $response .= "\nTo create this campaign, please use the Campaign Manager in your dashboard, or tell me more details like:\n- Campaign name\n- Connection message you'd like to send\n- Follow-up message strategy";

        return $response;
    }

    /**
     * Show campaign statistics.
     */
    private function handleCampaignStats(User $user, array $entities): string
    {
        $campaignName = $entities['campaign_name'] ?? null;

        if ($campaignName) {
            $campaign = ApexCampaign::query()
                ->where('user_id', $user->id)
                ->where('name', 'like', "%{$campaignName}%")
                ->first();
        } else {
            // Get the most recent active campaign
            $campaign = ApexCampaign::query()
                ->where('user_id', $user->id)
                ->orderBy('updated_at', 'desc')
                ->first();
        }

        if (! $campaign) {
            return "I couldn't find that campaign. Would you like to see a list of your campaigns?";
        }

        return "📊 **{$campaign->name}** Statistics:\n\n".
            '• Status: '.ucfirst($campaign->status)."\n".
            "• Connections Sent: {$campaign->connections_sent}\n".
            "• Connections Accepted: {$campaign->connections_accepted} ({$campaign->acceptance_rate}% rate)\n".
            "• Messages Sent: {$campaign->messages_sent}\n".
            "• Replies Received: {$campaign->replies_received} ({$campaign->reply_rate}% rate)\n".
            "• Meetings Booked: {$campaign->meetings_booked}\n\n".
            'Would you like to start, pause, or make changes to this campaign?';
    }

    /**
     * Start a campaign.
     */
    private function handleStartCampaign(User $user, array $entities): string
    {
        $campaignName = $entities['campaign_name'] ?? null;

        $campaign = $this->findCampaign($user, $campaignName);

        if (! $campaign) {
            return "I couldn't find that campaign. Please tell me the name of the campaign you want to start, or say \"show my campaigns\" to see them all.";
        }

        if ($campaign->status === 'active') {
            return "**{$campaign->name}** is already running! It has sent {$campaign->connections_sent} connections so far.";
        }

        if (! in_array($campaign->status, ['draft', 'paused'])) {
            return "**{$campaign->name}** cannot be started. It's currently {$campaign->status}.";
        }

        // Check if LinkedIn is connected
        $linkedIn = ApexLinkedInAccount::query()
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->first();

        if (! $linkedIn) {
            return 'Before starting your campaign, you need to connect your LinkedIn account. Say "connect LinkedIn" to get started.';
        }

        return "Ready to start **{$campaign->name}**! This will begin sending connection requests to your target prospects.\n\n".
            "To confirm, please go to the Campaign Manager and click the Start button, or say \"yes, start {$campaign->name}\".";
    }

    /**
     * Pause a campaign.
     */
    private function handlePauseCampaign(User $user, array $entities): string
    {
        $campaignName = $entities['campaign_name'] ?? null;

        $campaign = $this->findCampaign($user, $campaignName);

        if (! $campaign) {
            return "I couldn't find that campaign. Please tell me the name of the campaign you want to pause.";
        }

        if ($campaign->status !== 'active') {
            return "**{$campaign->name}** is not currently active. It's {$campaign->status}.";
        }

        return "To pause **{$campaign->name}**, please go to the Campaign Manager and click the Pause button, or confirm by saying \"yes, pause {$campaign->name}\".";
    }

    /**
     * List prospects.
     */
    private function handleListProspects(User $user): string
    {
        $total = ApexProspect::where('user_id', $user->id)->count();
        $connected = ApexProspect::where('user_id', $user->id)->where('connection_status', 'connected')->count();
        $pending = ApexProspect::where('user_id', $user->id)->where('connection_status', 'pending')->count();

        if ($total === 0) {
            return "You don't have any prospects yet. Would you like me to help you find some? You can:\n\n".
                "1. Import prospects from a LinkedIn search\n".
                "2. Add prospects manually\n".
                '3. Use our lead generation tools';
        }

        return "📋 **Your Prospects Summary:**\n\n".
            "• Total Prospects: {$total}\n".
            "• Connected: {$connected}\n".
            "• Pending Connection: {$pending}\n\n".
            'Would you like to add more prospects to a campaign?';
    }

    /**
     * Handle adding prospects.
     */
    private function handleAddProspects(User $user, array $entities): string
    {
        return "To add prospects to your campaigns, you can:\n\n".
            "1. **Import from LinkedIn**: Go to the Prospects tab and use the import feature\n".
            "2. **Use Lead Generation**: I can help you find prospects based on job titles and locations\n".
            "3. **Manual Entry**: Add individual prospects directly\n\n".
            'What would you like to do?';
    }

    /**
     * Handle LinkedIn connection request.
     */
    private function handleConnectLinkedIn(User $user, PortalAvailableAgent $agent): string
    {
        $linkedIn = ApexLinkedInAccount::query()
            ->where('user_id', $user->id)
            ->first();

        if ($linkedIn && $linkedIn->status === 'active') {
            return "Your LinkedIn account (**{$linkedIn->display_name}**) is already connected and active! 🎉\n\nYou're all set to run campaigns.";
        }

        if ($linkedIn && $linkedIn->requiresCheckpoint()) {
            return 'Your LinkedIn connection requires verification. Please check your email or LinkedIn app for a verification code, then enter it here.';
        }

        return "To connect your LinkedIn account:\n\n".
            "1. Go to your **Settings** page in the dashboard\n".
            "2. Click **Connect LinkedIn**\n".
            "3. Follow the secure authentication process\n\n".
            "This allows me to send connection requests and messages on your behalf. Your credentials are never stored - we use LinkedIn's official API.";
    }

    /**
     * Check LinkedIn connection status.
     */
    private function handleLinkedInStatus(User $user): string
    {
        $linkedIn = ApexLinkedInAccount::query()
            ->where('user_id', $user->id)
            ->first();

        if (! $linkedIn) {
            return "You haven't connected your LinkedIn account yet. Say \"connect LinkedIn\" to get started!";
        }

        $statusEmoji = match ($linkedIn->status) {
            'active' => '✅',
            'pending' => '⏳',
            'disconnected' => '❌',
            'error' => '⚠️',
            default => '❓',
        };

        $response = "{$statusEmoji} **LinkedIn Status:** ".ucfirst($linkedIn->status)."\n\n";

        if ($linkedIn->status === 'active') {
            $response .= "Connected as: **{$linkedIn->display_name}**\n";
            $response .= 'Last synced: '.($linkedIn->last_synced_at?->diffForHumans() ?? 'Never');
        } elseif ($linkedIn->requiresCheckpoint()) {
            $response .= '⚠️ Verification required. Please enter the code sent to your email/phone.';
        } elseif ($linkedIn->status === 'disconnected') {
            $response .= 'Your account was disconnected. Say "connect LinkedIn" to reconnect.';
        }

        return $response;
    }

    /**
     * Show pending actions.
     */
    private function handlePendingActions(User $user): string
    {
        $actions = ApexPendingAction::query()
            ->where('user_id', $user->id)
            ->pending()
            ->notExpired()
            ->with(['campaign', 'prospect'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        if ($actions->isEmpty()) {
            return "You have no pending actions awaiting approval. 🎉\n\nWhen I find prospects or want to send messages, I'll ask for your approval here first (unless you enable autopilot mode).";
        }

        $actionList = $actions->map(function ($action) {
            $type = str_replace('_', ' ', $action->action_type);
            $prospect = $action->prospect?->display_name ?? 'Unknown';

            return '• **'.ucwords($type)."** - {$prospect}";
        })->implode("\n");

        return "📋 **Pending Actions ({$actions->count()}):**\n\n{$actionList}\n\n".
            'Say "approve all" to approve these actions, or "deny all" to reject them.';
    }

    /**
     * Approve pending actions.
     */
    private function handleApproveActions(User $user, array $entities): string
    {
        $count = $entities['count'] ?? null;

        $query = ApexPendingAction::query()
            ->where('user_id', $user->id)
            ->pending()
            ->notExpired();

        if ($count) {
            $query->limit($count);
        }

        $actions = $query->get();

        if ($actions->isEmpty()) {
            return 'There are no pending actions to approve.';
        }

        // Note: In a real implementation, we would dispatch jobs to execute these
        return "I found {$actions->count()} pending action(s). To approve them, please go to the **Pending Actions** page in your dashboard and click Approve.\n\n".
            "Once approved, I'll execute these actions during the next campaign run.";
    }

    /**
     * Deny pending actions.
     */
    private function handleDenyActions(User $user, array $entities): string
    {
        $count = $entities['count'] ?? null;

        $query = ApexPendingAction::query()
            ->where('user_id', $user->id)
            ->pending()
            ->notExpired();

        $total = $query->count();

        if ($total === 0) {
            return 'There are no pending actions to deny.';
        }

        return "I found {$total} pending action(s). To deny them, please go to the **Pending Actions** page in your dashboard and click Deny.\n\n".
            "Denied actions will be removed and won't be executed.";
    }

    /**
     * Show help information.
     */
    private function handleHelp(): string
    {
        return "👋 Hi! I'm **Apex**, your LinkedIn outreach assistant. Here's what I can help you with:\n\n".
            "**Campaigns**\n".
            "• \"Show my campaigns\" - List your campaigns\n".
            "• \"Create a campaign targeting CTOs in Denver\" - Help create a new campaign\n".
            "• \"Show campaign stats\" - View performance metrics\n\n".
            "**LinkedIn**\n".
            "• \"Connect LinkedIn\" - Connect your account\n".
            "• \"LinkedIn status\" - Check connection status\n\n".
            "**Prospects**\n".
            "• \"Show my prospects\" - View prospect summary\n".
            "• \"Add prospects\" - Import or add new prospects\n\n".
            "**Actions**\n".
            "• \"Show pending actions\" - View actions awaiting approval\n".
            "• \"Approve all\" / \"Deny all\" - Manage pending actions\n\n".
            'What would you like to do?';
    }

    /**
     * Handle general questions about LinkedIn outreach.
     */
    private function handleGeneralQuestion(string $message): string
    {
        return "That's a great question about LinkedIn outreach! While I can help you manage your campaigns and prospects, for detailed strategy advice, I recommend:\n\n".
            "1. Starting with a clear target audience (specific job titles + locations)\n".
            "2. Writing personalized connection messages\n".
            "3. Following up 2-3 times with value-adding content\n\n".
            'Would you like me to help you create a campaign with these best practices?';
    }

    /**
     * Handle unknown intent.
     */
    private function handleUnknown(string $message): string
    {
        return "I'm not sure I understood that. I'm Apex, your LinkedIn outreach assistant. I can help you:\n\n".
            "• Manage campaigns\n".
            "• Track prospects\n".
            "• Connect your LinkedIn\n".
            "• Approve pending actions\n\n".
            'Say "help" to see everything I can do!';
    }

    /**
     * Find a campaign by name or get the most recent one.
     */
    private function findCampaign(User $user, ?string $name): ?ApexCampaign
    {
        if ($name) {
            return ApexCampaign::query()
                ->where('user_id', $user->id)
                ->where('name', 'like', "%{$name}%")
                ->first();
        }

        return ApexCampaign::query()
            ->where('user_id', $user->id)
            ->whereIn('status', ['active', 'draft', 'paused'])
            ->orderBy('updated_at', 'desc')
            ->first();
    }
}
