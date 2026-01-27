<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AgentAccess extends Model
{
    /** @use HasFactory<\Database\Factories\AgentAccessFactory> */
    use HasFactory;

    protected $table = 'agent_access';

    public $incrementing = false;

    protected $keyType = 'string';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'id',
        'subscription_id',
        'customer_id',
        'agent_type',
        'agent_name',
        'configuration',
        'is_active',
        'usage_count',
        'usage_limit',
        'last_used_at',
        'tenant_id',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'configuration' => 'array',
            'is_active' => 'boolean',
            'last_used_at' => 'datetime',
        ];
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(CustomerSubscription::class, 'subscription_id');
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(PortalTenant::class, 'tenant_id');
    }

    public function conversations(): HasMany
    {
        return $this->hasMany(AgentConversation::class, 'agent_access_id');
    }
}
