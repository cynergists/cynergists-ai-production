<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApexCampaignProspect extends Model
{
    /** @use HasFactory<\Database\Factories\ApexCampaignProspectFactory> */
    use HasFactory;

    use HasUuids;

    protected $table = 'apex_campaign_prospects';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'campaign_id',
        'prospect_id',
        'status',
        'connection_sent_at',
        'connection_accepted_at',
        'last_message_sent_at',
        'last_reply_at',
        'follow_up_count',
        'next_follow_up_at',
        'notes',
        'metadata',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'connection_sent_at' => 'datetime',
            'connection_accepted_at' => 'datetime',
            'last_message_sent_at' => 'datetime',
            'last_reply_at' => 'datetime',
            'next_follow_up_at' => 'datetime',
            'follow_up_count' => 'integer',
            'metadata' => 'array',
        ];
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
     * Scope for prospects ready for follow-up.
     *
     * @param  Builder<ApexCampaignProspect>  $query
     * @return Builder<ApexCampaignProspect>
     */
    public function scopeReadyForFollowUp(Builder $query): Builder
    {
        return $query->whereNotNull('next_follow_up_at')
            ->where('next_follow_up_at', '<=', now())
            ->whereIn('status', ['connection_accepted', 'message_sent']);
    }

    /**
     * Scope for queued prospects.
     *
     * @param  Builder<ApexCampaignProspect>  $query
     * @return Builder<ApexCampaignProspect>
     */
    public function scopeQueued(Builder $query): Builder
    {
        return $query->where('status', 'queued');
    }

    /**
     * Check if ready for follow-up.
     */
    public function isReadyForFollowUp(): bool
    {
        return $this->next_follow_up_at !== null
            && $this->next_follow_up_at->isPast()
            && in_array($this->status, ['connection_accepted', 'message_sent']);
    }
}
