<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BriggsUserSettings extends Model
{
    /** @use HasFactory<\Database\Factories\BriggsUserSettingsFactory> */
    use HasFactory;

    use HasUuids;

    protected $table = 'briggs_user_settings';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'skill_level',
        'preferred_industry',
        'briggs_context',
        'briggs_context_updated_at',
        'onboarding_completed',
        'total_sessions_completed',
        'average_score',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'onboarding_completed' => 'boolean',
            'briggs_context_updated_at' => 'datetime',
            'total_sessions_completed' => 'integer',
            'average_score' => 'decimal:2',
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
                'skill_level' => 'beginner',
                'onboarding_completed' => false,
                'total_sessions_completed' => 0,
            ]
        );
    }
}
