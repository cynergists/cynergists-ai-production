<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class PortalAvailableAgent extends Model
{
    /** @use HasFactory<\Database\Factories\PortalAvailableAgentFactory> */
    use HasFactory, HasUuids;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'id',
        'name',
        'avatar',
        'job_title',
        'slug',
        'redirect_url',
        'description',
        'price',
        'billing_type',
        'category',
        'website_category',
        'icon',
        'features',
        'is_popular',
        'is_active',
        'sort_order',
        'section_order',
        'perfect_for',
        'integrations',
        'image_url',
        'card_media',
        'product_media',
        'tiers',
        'long_description',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'features' => 'array',
            'is_popular' => 'boolean',
            'is_active' => 'boolean',
            'perfect_for' => 'array',
            'integrations' => 'array',
            'website_category' => 'array',
            'card_media' => 'array',
            'product_media' => 'array',
            'tiers' => 'array',
        ];
    }

    /**
     * The API keys associated with this agent.
     *
     * @return BelongsToMany<AgentApiKey, $this>
     */
    public function apiKeys(): BelongsToMany
    {
        return $this->belongsToMany(
            AgentApiKey::class,
            'agent_api_key_pivot',
            'agent_id',
            'api_key_id'
        )->withPivot('priority')->withTimestamps();
    }

    /**
     * Get an API key for a specific provider.
     * Returns the highest priority active key for the provider.
     */
    public function getApiKey(string $provider): ?string
    {
        $apiKey = $this->apiKeys()
            ->where('provider', $provider)
            ->where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->orderByPivot('priority', 'desc')
            ->first();

        return $apiKey?->key;
    }

    /**
     * Get an API key with its metadata for a specific provider.
     */
    public function getApiKeyWithMetadata(string $provider): ?AgentApiKey
    {
        return $this->apiKeys()
            ->where('provider', $provider)
            ->where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->orderByPivot('priority', 'desc')
            ->first();
    }
}
