<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AgentCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'sort_order',
        'is_active',
        'is_archived',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_archived' => 'boolean',
    ];

    /**
     * Get agents in this category.
     */
    public function agents()
    {
        return $this->hasMany(PortalAvailableAgent::class, 'category_id');
    }

    /**
     * Scope to only active, non-archived categories.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)->where('is_archived', false);
    }

    /**
     * Scope to get categories in sort order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }

    /**
     * Archive (not delete) a category.
     */
    public function archive(): void
    {
        $this->update(['is_archived' => true]);
    }

    /**
     * Unarchive a category.
     */
    public function unarchive(): void
    {
        $this->update(['is_archived' => false]);
    }
}
