<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ApexCampaign extends Model
{
    /** @use HasFactory<\Database\Factories\ApexCampaignFactory> */
    use HasFactory;

    use HasUuids;

    protected $table = 'apex_campaigns';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'name',
        'campaign_type',
        'status',
        'job_titles',
        'locations',
        'keywords',
        'industries',
        'connection_message',
        'follow_up_message_1',
        'follow_up_message_2',
        'follow_up_message_3',
        'follow_up_delay_days_1',
        'follow_up_delay_days_2',
        'follow_up_delay_days_3',
        'booking_method',
        'calendar_link',
        'phone_number',
        'daily_connection_limit',
        'daily_message_limit',
        'connections_sent',
        'connections_accepted',
        'messages_sent',
        'replies_received',
        'meetings_booked',
        'started_at',
        'paused_at',
        'completed_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'job_titles' => 'array',
            'locations' => 'array',
            'keywords' => 'array',
            'industries' => 'array',
            'follow_up_delay_days_1' => 'integer',
            'follow_up_delay_days_2' => 'integer',
            'follow_up_delay_days_3' => 'integer',
            'daily_connection_limit' => 'integer',
            'daily_message_limit' => 'integer',
            'connections_sent' => 'integer',
            'connections_accepted' => 'integer',
            'messages_sent' => 'integer',
            'replies_received' => 'integer',
            'meetings_booked' => 'integer',
            'started_at' => 'datetime',
            'paused_at' => 'datetime',
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
     * @return BelongsToMany<ApexProspect, $this>
     */
    public function prospects(): BelongsToMany
    {
        return $this->belongsToMany(
            ApexProspect::class,
            'apex_campaign_prospects',
            'campaign_id',
            'prospect_id'
        )->withPivot([
            'status',
            'connection_sent_at',
            'connection_accepted_at',
            'last_message_sent_at',
            'last_reply_at',
            'follow_up_count',
            'next_follow_up_at',
            'notes',
            'metadata',
        ])->withTimestamps();
    }

    /**
     * @return HasMany<ApexCampaignProspect, $this>
     */
    public function campaignProspects(): HasMany
    {
        return $this->hasMany(ApexCampaignProspect::class, 'campaign_id');
    }

    /**
     * @return HasMany<ApexPendingAction, $this>
     */
    public function pendingActions(): HasMany
    {
        return $this->hasMany(ApexPendingAction::class, 'campaign_id');
    }

    /**
     * @return HasMany<ApexActivityLog, $this>
     */
    public function activityLogs(): HasMany
    {
        return $this->hasMany(ApexActivityLog::class, 'campaign_id');
    }

    /**
     * Scope to get active campaigns.
     *
     * @param  Builder<ApexCampaign>  $query
     * @return Builder<ApexCampaign>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    /**
     * Check if the campaign is active.
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Auto-complete the campaign if all work is done.
     * Returns true if the campaign was completed.
     */
    public function autoCompleteIfDone(): bool
    {
        if ($this->status !== 'active') {
            return false;
        }

        $hasActiveProspects = $this->campaignProspects()
            ->whereIn('status', ['queued', 'connection_sent', 'connection_accepted', 'message_sent'])
            ->exists();

        if ($hasActiveProspects) {
            return false;
        }

        $hasPendingFollowUps = $this->campaignProspects()
            ->whereNotNull('next_follow_up_at')
            ->exists();

        if ($hasPendingFollowUps) {
            return false;
        }

        $hasPendingActions = $this->pendingActions()
            ->where('status', 'pending')
            ->exists();

        if ($hasPendingActions) {
            return false;
        }

        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        ApexActivityLog::log(
            $this->user,
            'campaign_completed',
            "Campaign auto-completed: {$this->name}",
            $this
        );

        return true;
    }

    /**
     * Calculate the acceptance rate.
     */
    public function getAcceptanceRateAttribute(): float
    {
        if ($this->connections_sent === 0) {
            return 0.0;
        }

        return round(($this->connections_accepted / $this->connections_sent) * 100, 2);
    }

    /**
     * Calculate the reply rate.
     */
    public function getReplyRateAttribute(): float
    {
        if ($this->messages_sent === 0) {
            return 0.0;
        }

        return round(($this->replies_received / $this->messages_sent) * 100, 2);
    }
}
