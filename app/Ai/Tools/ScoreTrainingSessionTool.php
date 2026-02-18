<?php

namespace App\Ai\Tools;

use App\Models\BriggsTrainingSession;
use App\Models\BriggsUserSettings;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;

class ScoreTrainingSessionTool implements Tool
{
    public function __construct(
        public User $user
    ) {}

    /**
     * Get the description of the tool's purpose.
     */
    public function description(): string
    {
        return 'Score and complete the active training session. Provide an overall score, breakdown by criteria, strengths, areas for improvement, and feedback. Call this when the user ends a role-play session.';
    }

    /**
     * Execute the tool.
     */
    public function handle(Request $request): string
    {
        $session = BriggsTrainingSession::query()
            ->where('user_id', $this->user->id)
            ->where('status', 'in_progress')
            ->latest()
            ->first();

        if (! $session) {
            return 'Error: No active training session found to score.';
        }

        $score = (float) ($request['score'] ?? 0);
        $scoreBreakdown = json_decode($request['score_breakdown'] ?? '[]', true);
        $strengths = json_decode($request['strengths'] ?? '[]', true);
        $improvements = json_decode($request['improvements'] ?? '[]', true);
        $aiFeedback = $request['ai_feedback'] ?? '';

        // Calculate duration
        $durationSeconds = $session->started_at
            ? (int) now()->diffInSeconds($session->started_at)
            : null;

        // Update the session
        $session->update([
            'status' => 'completed',
            'score' => $score,
            'score_breakdown' => $scoreBreakdown,
            'strengths' => $strengths,
            'improvements' => $improvements,
            'ai_feedback' => $aiFeedback,
            'duration_seconds' => $durationSeconds,
            'completed_at' => now(),
        ]);

        // Update user stats
        $settings = BriggsUserSettings::forUser($this->user);
        $newTotal = $settings->total_sessions_completed + 1;

        // Recalculate average score
        $avgScore = BriggsTrainingSession::query()
            ->where('user_id', $this->user->id)
            ->where('status', 'completed')
            ->avg('score');

        $settings->update([
            'total_sessions_completed' => $newTotal,
            'average_score' => $avgScore,
        ]);

        return "Session scored and completed successfully. Score: {$score}/100. Total sessions: {$newTotal}. Average score: ".round($avgScore, 2).'/100.';
    }

    /**
     * Get the tool's schema definition.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'score' => $schema
                ->number()
                ->description('Overall score from 0 to 100. Required.'),
            'score_breakdown' => $schema
                ->string()
                ->description('JSON string of score breakdown array. Each item: {"criterion": "name", "score": number, "max_score": number, "feedback": "text"}. Required.'),
            'strengths' => $schema
                ->string()
                ->description('JSON string array of 2-3 specific strengths observed. Required.'),
            'improvements' => $schema
                ->string()
                ->description('JSON string array of 2-3 specific areas for improvement. Required.'),
            'ai_feedback' => $schema
                ->string()
                ->description('A summary paragraph of coaching feedback. Required.'),
        ];
    }
}
