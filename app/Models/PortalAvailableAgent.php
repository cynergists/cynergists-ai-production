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

    protected static function booted(): void
    {
        static::saving(function (PortalAvailableAgent $agent) {
            // Automatically set base price from lowest tier when saving
            if (! empty($agent->tiers) && is_array($agent->tiers)) {
                $prices = array_map(
                    fn ($tier) => is_numeric($tier['price'] ?? null) ? (float) $tier['price'] : PHP_FLOAT_MAX,
                    $agent->tiers
                );
                $lowestPrice = min($prices);
                if ($lowestPrice < PHP_FLOAT_MAX) {
                    $agent->price = $lowestPrice;
                }
            }

            // Process card_media: convert file paths to full URLs
            if (! empty($agent->card_media) && is_array($agent->card_media)) {
                $agent->card_media = self::processMediaArray($agent->card_media);
            }

            // Process product_media: convert file paths to full URLs
            if (! empty($agent->product_media) && is_array($agent->product_media)) {
                $agent->product_media = self::processMediaArray($agent->product_media);
            }
        });
    }

    /**
     * Process media array to convert file uploads to storage URLs.
     * Keeps both url and file fields separate.
     *
     * @param  array<int, array<string, mixed>>  $mediaArray
     * @return array<int, array<string, mixed>>
     */
    private static function processMediaArray(array $mediaArray): array
    {
        return array_map(function ($item) {
            // Convert file path to full storage URL if uploaded
            if (! empty($item['file'])) {
                $item['file'] = '/storage/'.$item['file'];
            }

            return $item;
        }, $mediaArray);
    }

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
