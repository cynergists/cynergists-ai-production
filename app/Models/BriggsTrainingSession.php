<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BriggsTrainingSession extends Model
{
    /** @use HasFactory<\Database\Factories\BriggsTrainingSessionFactory> */
    use HasFactory;

    use HasUuids;

    protected $table = 'briggs_training_sessions';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'scenario_id',
        'title',
        'category',
        'difficulty',
        'status',
        'conversation_log',
        'score',
        'score_breakdown',
        'strengths',
        'improvements',
        'ai_feedback',
        'duration_seconds',
        'started_at',
        'completed_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'conversation_log' => 'array',
            'score_breakdown' => 'array',
            'strengths' => 'array',
            'improvements' => 'array',
            'score' => 'decimal:2',
            'duration_seconds' => 'integer',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<BriggsTrainingScenario, $this>
     */
    public function scenario(): BelongsTo
    {
        return $this->belongsTo(BriggsTrainingScenario::class, 'scenario_id');
    }

    /**
     * Scope to get completed sessions.
     *
     * @param  Builder<BriggsTrainingSession>  $query
     * @return Builder<BriggsTrainingSession>
     */
    public function scopeCompleted(Builder $query): Builder
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope to get in-progress sessions.
     *
     * @param  Builder<BriggsTrainingSession>  $query
     * @return Builder<BriggsTrainingSession>
     */
    public function scopeInProgress(Builder $query): Builder
    {
        return $query->where('status', 'in_progress');
    }

    /**
     * Get the formatted duration (e.g., "5m 30s").
     */
    public function getFormattedDurationAttribute(): ?string
    {
        if ($this->duration_seconds === null) {
            return null;
        }

        $minutes = intdiv($this->duration_seconds, 60);
        $seconds = $this->duration_seconds % 60;

        return "{$minutes}m {$seconds}s";
    }
}
