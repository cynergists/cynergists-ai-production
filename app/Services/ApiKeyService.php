<?php

namespace App\Services;

use App\Models\AgentApiKey;
use App\Models\PortalAvailableAgent;
use Illuminate\Support\Collection;

class ApiKeyService
{
    /**
     * Get an API key for a specific provider.
     * Returns the highest priority active key for the provider.
     */
    public function getKey(PortalAvailableAgent $agent, string $provider): ?string
    {
        return $agent->getApiKey($provider);
    }

    /**
     * Get an API key with its metadata for a specific provider.
     */
    public function getKeyWithMetadata(PortalAvailableAgent $agent, string $provider): ?AgentApiKey
    {
        return $agent->getApiKeyWithMetadata($provider);
    }

    /**
     * Get all API keys for an agent.
     *
     * @return Collection<int, AgentApiKey>
     */
    public function getAllKeys(PortalAvailableAgent $agent): Collection
    {
        return $agent->apiKeys()
            ->where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->orderByPivot('priority', 'desc')
            ->get();
    }

    /**
     * Get all API keys for a specific provider across all agents.
     *
     * @return Collection<int, AgentApiKey>
     */
    public function getKeysForProvider(string $provider): Collection
    {
        return AgentApiKey::query()
            ->active()
            ->forProvider($provider)
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->get();
    }

    /**
     * Check if an agent has a valid API key for a specific provider.
     */
    public function hasValidKey(PortalAvailableAgent $agent, string $provider): bool
    {
        return $agent->getApiKey($provider) !== null;
    }

    /**
     * Attach an API key to an agent with optional priority.
     */
    public function attachKeyToAgent(
        AgentApiKey $apiKey,
        PortalAvailableAgent $agent,
        int $priority = 0
    ): void {
        $agent->apiKeys()->syncWithoutDetaching([
            $apiKey->id => ['priority' => $priority],
        ]);
    }

    /**
     * Detach an API key from an agent.
     */
    public function detachKeyFromAgent(AgentApiKey $apiKey, PortalAvailableAgent $agent): void
    {
        $agent->apiKeys()->detach($apiKey->id);
    }

    /**
     * Get metadata value from an API key.
     *
     * @param  mixed  $default
     * @return mixed
     */
    public function getMetadataValue(AgentApiKey $apiKey, string $key, $default = null)
    {
        return $apiKey->metadata[$key] ?? $default;
    }
}
