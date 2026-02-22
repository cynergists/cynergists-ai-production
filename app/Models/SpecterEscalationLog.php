<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SpecterEscalationLog extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'specter_session_id',
        'visitor_id',
        'reason_code',
        'details',
        'integration',
        'provider',
    ];

    protected function casts(): array
    {
        return [
            'details' => 'array',
        ];
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(SpecterSession::class, 'specter_session_id');
    }
}
