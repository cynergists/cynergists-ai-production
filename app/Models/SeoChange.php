<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SeoChange extends Model
{
    /** @use HasFactory<\Database\Factories\SeoChangeFactory> */
    use HasFactory;
    use HasUuids;

    public $incrementing = false;

    protected $keyType = 'string';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'id',
        'seo_site_id',
        'seo_recommendation_id',
        'status',
        'summary',
        'diff',
        'metadata',
        'applied_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'diff' => 'array',
            'metadata' => 'array',
            'applied_at' => 'datetime',
        ];
    }

    public function site(): BelongsTo
    {
        return $this->belongsTo(SeoSite::class, 'seo_site_id');
    }

    public function recommendation(): BelongsTo
    {
        return $this->belongsTo(SeoRecommendation::class, 'seo_recommendation_id');
    }
}
