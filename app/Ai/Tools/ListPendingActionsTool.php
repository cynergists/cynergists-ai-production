<?php

namespace App\Ai\Tools;

use App\Models\ApexPendingAction;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;

class ListPendingActionsTool implements Tool
{
    public function __construct(
        public User $user
    ) {}

    /**
     * Get the description of the tool's purpose.
     */
    public function description(): string
    {
        return "List pending actions awaiting the user's approval. Use this when the user asks about pending actions or approvals.";
    }

    /**
     * Execute the tool.
     */
    public function handle(Request $request): string
    {
        $actions = ApexPendingAction::query()
            ->where('user_id', $this->user->id)
            ->where('status', 'pending')
            ->with(['campaign', 'prospect'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        if ($actions->isEmpty()) {
            return 'No pending actions. All actions have been processed or there are none queued.';
        }

        $result = "Found {$actions->count()} pending action(s):\n";

        foreach ($actions as $action) {
            $type = str_replace('_', ' ', $action->action_type);
            $prospect = $action->prospect?->full_name ?? 'Unknown';
            $campaign = $action->campaign?->name ?? 'Unknown campaign';

            $result .= "\n- [{$action->id}] ".ucwords($type);
            $result .= " → {$prospect}";
            $result .= " (Campaign: {$campaign})";

            if ($action->expires_at) {
                $result .= " — Expires: {$action->expires_at->diffForHumans()}";
            }
        }

        $result .= "\n\nThe user can approve or deny these actions from the Pending Actions page in their dashboard.";

        return $result;
    }

    /**
     * Get the tool's schema definition.
     */
    public function schema(JsonSchema $schema): array
    {
        return [];
    }
}
