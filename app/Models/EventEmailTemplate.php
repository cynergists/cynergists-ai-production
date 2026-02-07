<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventEmailTemplate extends Model
{
    /** @use HasFactory<\Database\Factories\EventEmailTemplateFactory> */
    use HasFactory, HasUuids;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'system_event_id',
        'recipient_type',
        'name',
        'subject',
        'body',
        'is_active',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<SystemEvent, $this>
     */
    public function systemEvent(): BelongsTo
    {
        return $this->belongsTo(SystemEvent::class);
    }
}
