<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ApexProspect extends Model
{
    /** @use HasFactory<\Database\Factories\ApexProspectFactory> */
    use HasFactory;

    use HasUuids;

    protected $table = 'apex_prospects';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'linkedin_profile_id',
        'linkedin_profile_url',
        'first_name',
        'last_name',
        'full_name',
        'headline',
        'company',
        'job_title',
        'location',
        'email',
        'phone',
        'avatar_url',
        'connection_status',
        'metadata',
        'source',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'metadata' => 'array',
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
     * @return BelongsToMany<ApexCampaign, $this>
     */
    public function campaigns(): BelongsToMany
    {
        return $this->belongsToMany(
            ApexCampaign::class,
            'apex_campaign_prospects',
            'prospect_id',
            'campaign_id'
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
        return $this->hasMany(ApexCampaignProspect::class, 'prospect_id');
    }

    /**
     * @return HasMany<ApexPendingAction, $this>
     */
    public function pendingActions(): HasMany
    {
        return $this->hasMany(ApexPendingAction::class, 'prospect_id');
    }

    /**
     * @return HasMany<ApexActivityLog, $this>
     */
    public function activityLogs(): HasMany
    {
        return $this->hasMany(ApexActivityLog::class, 'prospect_id');
    }

    /**
     * Scope to get connected prospects.
     *
     * @param  Builder<ApexProspect>  $query
     * @return Builder<ApexProspect>
     */
    public function scopeConnected(Builder $query): Builder
    {
        return $query->where('connection_status', 'connected');
    }

    /**
     * Scope to get pending connection prospects.
     *
     * @param  Builder<ApexProspect>  $query
     * @return Builder<ApexProspect>
     */
    public function scopePendingConnection(Builder $query): Builder
    {
        return $query->where('connection_status', 'pending');
    }

    /**
     * Check if connected.
     */
    public function isConnected(): bool
    {
        return $this->connection_status === 'connected';
    }

    /**
     * Get display name.
     */
    public function getDisplayNameAttribute(): string
    {
        if ($this->full_name) {
            return $this->full_name;
        }

        return trim(($this->first_name ?? '').' '.($this->last_name ?? '')) ?: 'Unknown';
    }
}
