<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SpecterVisitor extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'visitor_id',
        'cookie_ids',
        'consent_state',
        'consent_version',
        'dnt',
        'first_seen_at',
        'last_seen_at',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'cookie_ids' => 'array',
            'metadata' => 'array',
            'dnt' => 'boolean',
            'first_seen_at' => 'datetime',
            'last_seen_at' => 'datetime',
        ];
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(PortalTenant::class, 'tenant_id');
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(SpecterSession::class);
    }
}
