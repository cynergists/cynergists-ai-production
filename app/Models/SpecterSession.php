<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SpecterSession extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'specter_visitor_id',
        'session_id',
        'started_at',
        'ended_at',
        'intent_score',
        'intent_tier',
        'heat_zone',
        'resolution_status',
        'resolution_confidence',
        'resolution_source',
        'scoring_feature_breakdown',
        'metrics',
        'last_page_url',
        'referrer',
        'utm_params',
        'device_type',
        'ip_hash',
        'company_name',
        'company_domain',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'ended_at' => 'datetime',
            'scoring_feature_breakdown' => 'array',
            'metrics' => 'array',
            'utm_params' => 'array',
            'intent_score' => 'integer',
            'resolution_confidence' => 'decimal:2',
        ];
    }

    public function visitor(): BelongsTo
    {
        return $this->belongsTo(SpecterVisitor::class, 'specter_visitor_id');
    }

    public function events(): HasMany
    {
        return $this->hasMany(SpecterEvent::class);
    }
}
