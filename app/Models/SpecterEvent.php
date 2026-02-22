<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SpecterEvent extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'specter_session_id',
        'event_id',
        'type',
        'page_url',
        'occurred_at',
        'metadata',
        'is_bot',
    ];

    protected function casts(): array
    {
        return [
            'occurred_at' => 'datetime',
            'metadata' => 'array',
            'is_bot' => 'boolean',
        ];
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(SpecterSession::class, 'specter_session_id');
    }
}
