<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class AgentApiKey extends Model
{
    /** @use HasFactory<\Database\Factories\AgentApiKeyFactory> */
    use HasFactory;

    use HasUuids;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'provider',
        'key',
        'metadata',
        'is_active',
        'expires_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'key' => 'encrypted',
            'metadata' => 'array',
            'is_active' => 'boolean',
            'expires_at' => 'datetime',
        ];
    }

    /**
     * The agents that have access to this API key.
     *
     * @return BelongsToMany<PortalAvailableAgent, $this>
     */
    public function agents(): BelongsToMany
    {
        return $this->belongsToMany(
            PortalAvailableAgent::class,
            'agent_api_key_pivot',
            'api_key_id',
            'agent_id'
        )->withPivot('priority')->withTimestamps();
    }

    /**
     * Scope a query to only include active API keys.
     *
     * @param  Builder<AgentApiKey>  $query
     * @return Builder<AgentApiKey>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include keys for a specific provider.
     *
     * @param  Builder<AgentApiKey>  $query
     * @return Builder<AgentApiKey>
     */
    public function scopeForProvider(Builder $query, string $provider): Builder
    {
        return $query->where('provider', $provider);
    }

    /**
     * Check if the API key has expired.
     */
    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }

    /**
     * Check if the API key is valid (active and not expired).
     */
    public function isValid(): bool
    {
        return $this->is_active && ! $this->isExpired();
    }
}
