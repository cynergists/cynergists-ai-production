<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SeoSite extends Model
{
    /** @use HasFactory<\Database\Factories\SeoSiteFactory> */
    use HasFactory;
    use HasUuids;

    public $incrementing = false;

    protected $keyType = 'string';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'id',
        'tenant_id',
        'user_id',
        'name',
        'url',
        'status',
        'settings',
        'last_audit_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'settings' => 'array',
            'last_audit_at' => 'datetime',
        ];
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(PortalTenant::class, 'tenant_id');
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function audits(): HasMany
    {
        return $this->hasMany(SeoAudit::class);
    }

    public function recommendations(): HasMany
    {
        return $this->hasMany(SeoRecommendation::class);
    }

    public function changes(): HasMany
    {
        return $this->hasMany(SeoChange::class);
    }

    public function reports(): HasMany
    {
        return $this->hasMany(SeoReport::class);
    }
}
