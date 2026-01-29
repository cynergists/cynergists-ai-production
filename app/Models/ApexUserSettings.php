<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApexUserSettings extends Model
{
    /** @use HasFactory<\Database\Factories\ApexUserSettingsFactory> */
    use HasFactory;

    use HasUuids;

    protected $table = 'apex_user_settings';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'unipile_account_id',
        'autopilot_enabled',
        'auto_reply_enabled',
        'meeting_link',
        'apex_context',
        'apex_context_updated_at',
        'onboarding_completed',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'autopilot_enabled' => 'boolean',
            'auto_reply_enabled' => 'boolean',
            'onboarding_completed' => 'boolean',
            'apex_context_updated_at' => 'datetime',
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
     * Get or create settings for a user.
     */
    public static function forUser(User $user): self
    {
        return self::firstOrCreate(
            ['user_id' => $user->id],
            [
                'autopilot_enabled' => false,
                'auto_reply_enabled' => false,
                'onboarding_completed' => false,
            ]
        );
    }
}
