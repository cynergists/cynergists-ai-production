<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApexActivityLog extends Model
{
    /** @use HasFactory<\Database\Factories\ApexActivityLogFactory> */
    use HasFactory;

    use HasUuids;

    protected $table = 'apex_activity_log';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'campaign_id',
        'prospect_id',
        'activity_type',
        'description',
        'metadata',
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
     * Log an activity.
     */
    public static function log(
        User $user,
        string $activityType,
        ?string $description = null,
        ?ApexCampaign $campaign = null,
        ?ApexProspect $prospect = null,
        ?array $metadata = null
    ): self {
        return self::create([
            'user_id' => $user->id,
            'campaign_id' => $campaign?->id,
            'prospect_id' => $prospect?->id,
            'activity_type' => $activityType,
            'description' => $description,
            'metadata' => $metadata,
        ]);
    }
}
