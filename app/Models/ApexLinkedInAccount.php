<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApexLinkedInAccount extends Model
{
    /** @use HasFactory<\Database\Factories\ApexLinkedInAccountFactory> */
    use HasFactory;

    use HasUuids;

    protected $table = 'apex_linkedin_accounts';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'unipile_account_id',
        'linkedin_profile_id',
        'linkedin_profile_url',
        'display_name',
        'email',
        'avatar_url',
        'status',
        'checkpoint_type',
        'metadata',
        'last_synced_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'last_synced_at' => 'datetime',
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
     * Scope to get active accounts.
     *
     * @param  Builder<ApexLinkedInAccount>  $query
     * @return Builder<ApexLinkedInAccount>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    /**
     * Check if the account is active.
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Check if the account requires checkpoint resolution.
     */
    public function requiresCheckpoint(): bool
    {
        return $this->status === 'pending' && $this->checkpoint_type !== null;
    }
}
