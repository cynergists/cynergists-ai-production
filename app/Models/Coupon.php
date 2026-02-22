<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Coupon Model
 * Per Google Doc Spec: Custom Coupon Codes System
 */
class Coupon extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'description',
        'discount_type',
        'discount_value',
        'duration_days',
        'valid_from',
        'valid_until',
        'max_redemptions_per_customer',
        'max_redemptions_global',
        'redemptions_count',
        'customer_eligibility',
        'applicable_agent_ids',
        'is_active',
        'allow_stacking',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'valid_from' => 'datetime',
        'valid_until' => 'datetime',
        'applicable_agent_ids' => 'array',
        'is_active' => 'boolean',
        'allow_stacking' => 'boolean',
    ];

    /**
     * Get redemptions for this coupon.
     */
    public function redemptions()
    {
        return $this->hasMany(CouponRedemption::class);
    }

    /**
     * Get audit logs for this coupon.
     */
    public function auditLogs()
    {
        return $this->hasMany(CouponAuditLog::class);
    }

    /**
     * Get the admin who created this coupon.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Check if coupon is currently valid (within redemption window).
     */
    public function isValid(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        $now = now();
        return $now->between($this->valid_from, $this->valid_until);
    }

    /**
     * Check if coupon has reached global redemption limit.
     */
    public function hasReachedGlobalLimit(): bool
    {
        if ($this->max_redemptions_global === null) {
            return false;
        }

        return $this->redemptions_count >= $this->max_redemptions_global;
    }

    /**
     * Check if user has reached per-customer limit for this coupon.
     */
    public function hasUserReachedLimit(string $userId): bool
    {
        $userRedemptions = $this->redemptions()
            ->where('user_id', $userId)
            ->count();

        return $userRedemptions >= $this->max_redemptions_per_customer;
    }

    /**
     * Check if coupon applies to a specific agent.
     */
    public function appliesTo(?string $agentId): bool
    {
        // null = all agents
        if ($this->applicable_agent_ids === null || empty($this->applicable_agent_ids)) {
            return true;
        }

        return in_array($agentId, $this->applicable_agent_ids);
    }

    /**
     * Validate coupon for a user and agent.
     */
    public function validate(string $userId, ?string $agentId = null): array
    {
        if (!$this->isValid()) {
            return ['valid' => false, 'error' => 'This coupon code is not currently valid.'];
        }

        if ($this->hasReachedGlobalLimit()) {
            return ['valid' => false, 'error' => 'This coupon has reached its redemption limit.'];
        }

        if ($this->hasUserReachedLimit($userId)) {
            return ['valid' => false, 'error' => 'You have already used this coupon.'];
        }

        if ($agentId && !$this->appliesTo($agentId)) {
            return ['valid' => false, 'error' => 'This coupon does not apply to the selected agent.'];
        }

        return ['valid' => true];
    }

    /**
     * Increment redemption count.
     */
    public function incrementRedemptions(): void
    {
        $this->increment('redemptions_count');
    }

    /**
     * Scope to active coupons only.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->where('valid_from', '<=', now())
            ->where('valid_until', '>=', now());
    }

    /**
     * Format code to uppercase for consistency.
     */
    public function setCodeAttribute($value)
    {
        $this->attributes['code'] = strtoupper($value);
    }
}
