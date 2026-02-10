<?php

namespace App\Ai\Tools;

use App\Models\BriggsTrainingSession;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;

class GetSessionHistoryTool implements Tool
{
    public function __construct(
        public User $user
    ) {}

    /**
     * Get the description of the tool's purpose.
     */
    public function description(): string
    {
        return "Get the user's past training session history with scores and feedback. Use this when the user asks about their progress or past sessions.";
    }

    /**
     * Execute the tool.
     */
    public function handle(Request $request): string
    {
        $limit = (int) ($request['limit'] ?? 10);
        $categoryFilter = $request['category_filter'] ?? null;

        $query = BriggsTrainingSession::query()
            ->where('user_id', $this->user->id)
            ->where('status', 'completed')
            ->with('scenario:id,title,category,difficulty')
            ->orderByDesc('completed_at')
            ->limit($limit);

        if ($categoryFilter) {
            $query->where('category', $categoryFilter);
        }

        $sessions = $query->get();

        if ($sessions->isEmpty()) {
            return $categoryFilter
                ? "No completed sessions found for category \"{$categoryFilter}\"."
                : 'No completed training sessions found. The user has not completed any sessions yet.';
        }

        $result = "Found {$sessions->count()} completed session(s):\n";

        foreach ($sessions as $session) {
            $scenarioTitle = $session->scenario?->title ?? $session->title;
            $category = str_replace('_', ' ', ucfirst($session->category ?? 'Unknown'));
            $difficulty = ucfirst($session->difficulty ?? 'Unknown');
            $date = $session->completed_at?->format('M j, Y') ?? 'Unknown';
            $score = $session->score ?? 'N/A';
            $duration = $session->formatted_duration ?? 'Unknown';

            $result .= "\n[{$session->id}] {$scenarioTitle}";
            $result .= "\n  Score: {$score}/100 | Category: {$category} | Difficulty: {$difficulty}";
            $result .= "\n  Date: {$date} | Duration: {$duration}";

            if (is_array($session->strengths) && count($session->strengths) > 0) {
                $result .= "\n  Strengths: ".implode(', ', $session->strengths);
            }

            if (is_array($session->improvements) && count($session->improvements) > 0) {
                $result .= "\n  Areas to improve: ".implode(', ', $session->improvements);
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
            'limit' => $schema
                ->integer()
                ->description('Number of sessions to retrieve (default 10, max 25).'),
            'category_filter' => $schema
                ->string()
                ->description('Optional filter by category: objection_handling, cold_call, discovery_call, pitch, closing, follow_up, or negotiation.'),
        ];
    }
}
