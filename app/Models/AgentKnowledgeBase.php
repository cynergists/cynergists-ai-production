<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class AgentKnowledgeBase extends Model
{
    protected $fillable = [
        'agent_name',
        'title',
        'content',
        'is_active',
        'version',
        'last_updated_by_user_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'last_updated_by_user_at' => 'datetime',
    ];

    /**
     * Get the cache key for this knowledge base.
     */
    public function getCacheKey(): string
    {
        return "agent_knowledge_base:{$this->agent_name}";
    }

    /**
     * Get knowledge base content for an agent (cached).
     */
    public static function getForAgent(string $agentName): ?string
    {
        $cacheKey = "agent_knowledge_base:{$agentName}";

        return Cache::remember($cacheKey, now()->addHours(24), function () use ($agentName) {
            $kb = self::where('agent_name', $agentName)
                ->where('is_active', true)
                ->first();

            return $kb?->content;
        });
    }

    /**
     * Clear cache when model is updated or deleted.
     */
    protected static function booted(): void
    {
        static::saved(function (AgentKnowledgeBase $kb) {
            Cache::forget($kb->getCacheKey());
        });

        static::deleted(function (AgentKnowledgeBase $kb) {
            Cache::forget($kb->getCacheKey());
        });
    }
}
