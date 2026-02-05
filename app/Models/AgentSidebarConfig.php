<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class AgentSidebarConfig extends Model
{
    protected $fillable = [
        'agent_name',
        'quick_links',
        'activity_sections',
        'show_support_button',
        'support_button_text',
    ];

    protected $casts = [
        'quick_links' => 'array',
        'activity_sections' => 'array',
        'show_support_button' => 'boolean',
    ];

    /**
     * Get the cache key for this sidebar config.
     */
    public function getCacheKey(): string
    {
        return "agent_sidebar_config:{$this->agent_name}";
    }

    /**
     * Get sidebar config for an agent (cached).
     */
    public static function getForAgent(string $agentName): ?self
    {
        $cacheKey = "agent_sidebar_config:{$agentName}";

        return Cache::remember($cacheKey, now()->addHours(24), function () use ($agentName) {
            return self::where('agent_name', $agentName)->first();
        });
    }

    /**
     * Clear cache when model is updated or deleted.
     */
    protected static function booted(): void
    {
        static::saved(function (AgentSidebarConfig $config) {
            Cache::forget($config->getCacheKey());
        });

        static::deleted(function (AgentSidebarConfig $config) {
            Cache::forget($config->getCacheKey());
        });
    }
}
