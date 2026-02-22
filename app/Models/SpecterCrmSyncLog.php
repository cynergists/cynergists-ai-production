<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SpecterCrmSyncLog extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'specter_session_id',
        'crm_object_type',
        'crm_object_id',
        'operation',
        'status',
        'error_code',
        'error_message',
        'payload_summary',
    ];

    protected function casts(): array
    {
        return [
            'payload_summary' => 'array',
        ];
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(SpecterSession::class, 'specter_session_id');
    }
}
