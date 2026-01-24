<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PortalTenant extends Model
{
    /** @use HasFactory<\Database\Factories\PortalTenantFactory> */
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'id',
        'user_id',
        'company_name',
        'subdomain',
        'is_temp_subdomain',
        'logo_url',
        'primary_color',
        'settings',
        'status',
        'onboarding_completed_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_temp_subdomain' => 'boolean',
            'settings' => 'array',
            'onboarding_completed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(CustomerSubscription::class, 'tenant_id');
    }

    public function agentAccesses(): HasMany
    {
        return $this->hasMany(AgentAccess::class, 'tenant_id');
    }

    public function agentConversations(): HasMany
    {
        return $this->hasMany(AgentConversation::class, 'tenant_id');
    }
}
