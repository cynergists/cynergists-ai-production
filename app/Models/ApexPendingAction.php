<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApexPendingAction extends Model
{
    /** @use HasFactory<\Database\Factories\ApexPendingActionFactory> */
    use HasFactory;

    use HasUuids;

    protected $table = 'apex_pending_actions';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'campaign_id',
        'prospect_id',
        'action_type',
        'status',
        'message_content',
        'metadata',
        'expires_at',
        'approved_at',
        'executed_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'expires_at' => 'datetime',
            'approved_at' => 'datetime',
            'executed_at' => 'datetime',
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
     * @return BelongsTo<ApexCampaign, $this>
     */
    public function campaign(): BelongsTo
    {
        return $this->belongsTo(ApexCampaign::class, 'campaign_id');
    }

    /**
     * @return BelongsTo<ApexProspect, $this>
     */
    public function prospect(): BelongsTo
    {
        return $this->belongsTo(ApexProspect::class, 'prospect_id');
    }

    /**
     * Scope for pending actions.
     *
     * @param  Builder<ApexPendingAction>  $query
     * @return Builder<ApexPendingAction>
     */
    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for non-expired actions.
     *
     * @param  Builder<ApexPendingAction>  $query
     * @return Builder<ApexPendingAction>
     */
    public function scopeNotExpired(Builder $query): Builder
    {
        return $query->where(function ($q) {
            $q->whereNull('expires_at')
                ->orWhere('expires_at', '>', now());
        });
    }

    /**
     * Check if the action is pending.
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if the action has expired.
     */
    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }

    /**
     * Approve the action.
     */
    public function approve(): bool
    {
        if (! $this->isPending() || $this->isExpired()) {
            return false;
        }

        $this->update([
            'status' => 'approved',
            'approved_at' => now(),
        ]);

        return true;
    }

    /**
     * Deny the action.
     */
    public function deny(): bool
    {
        if (! $this->isPending()) {
            return false;
        }

        $this->update([
            'status' => 'denied',
        ]);

        return true;
    }

    /**
     * Mark the action as executed.
     */
    public function markExecuted(): void
    {
        $this->update([
            'status' => 'executed',
            'executed_at' => now(),
        ]);
    }
}
