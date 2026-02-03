<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SeoRecommendation extends Model
{
    /** @use HasFactory<\Database\Factories\SeoRecommendationFactory> */
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'id',
        'seo_site_id',
        'seo_audit_id',
        'type',
        'title',
        'description',
        'target_pages',
        'impact_score',
        'effort',
        'status',
        'metadata',
        'approved_at',
        'applied_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'target_pages' => 'array',
            'metadata' => 'array',
            'approved_at' => 'datetime',
            'applied_at' => 'datetime',
        ];
    }

    public function site(): BelongsTo
    {
        return $this->belongsTo(SeoSite::class, 'seo_site_id');
    }

    public function audit(): BelongsTo
    {
        return $this->belongsTo(SeoAudit::class, 'seo_audit_id');
    }

    public function approvals(): HasMany
    {
        return $this->hasMany(SeoRecommendationApproval::class, 'seo_recommendation_id');
    }

    public function changes(): HasMany
    {
        return $this->hasMany(SeoChange::class, 'seo_recommendation_id');
    }
}
