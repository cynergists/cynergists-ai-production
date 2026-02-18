<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MosaicChangeLog extends Model
{
    protected $fillable = [
        'tenant_id',
        'user_id',
        'change_type',
        'description',
        'requested_at',
        'applied_at',
    ];

    protected function casts(): array
    {
        return [
            'requested_at' => 'datetime',
            'applied_at' => 'datetime',
        ];
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(PortalTenant::class, 'tenant_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
