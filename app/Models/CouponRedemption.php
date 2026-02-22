<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CouponRedemption extends Model
{
    use HasFactory;

    protected $fillable = [
        'coupon_id',
        'user_id',
        'agent_id',
        'subscription_id',
        'redeemed_at',
        'discount_amount',
        'trial_days',
        'trial_ends_at',
        'status',
        'expires_at',
        'cancelled_at',
        'cancellation_reason',
        'converted_to_paid',
        'converted_at',
        'first_paid_amount',
    ];

    protected $casts = [
        'redeemed_at' => 'datetime',
        'trial_ends_at' => 'datetime',
        'expires_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'converted_at' => 'datetime',
        'converted_to_paid' => 'boolean',
        'discount_amount' => 'decimal:2',
        'first_paid_amount' => 'decimal:2',
    ];

    /**
     * Get the coupon.
     */
    public function coupon()
    {
        return $this->belongsTo(Coupon::class);
    }

    /**
     * Get the user who redeemed.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Check if trial is active.
     */
    public function isTrialActive(): bool
    {
        if ($this->status !== 'active') {
            return false;
        }

        if ($this->trial_ends_at === null) {
            return false;
        }

        return now()->lt($this->trial_ends_at);
    }

    /**
     * Mark as converted to paid.
     */
    public function markConverted(float $amount): void
    {
        $this->update([
            'status' => 'converted',
            'converted_to_paid' => true,
            'converted_at' => now(),
            'first_paid_amount' => $amount,
        ]);
    }

    /**
     * Cancel the redemption.
     */
    public function cancel(string $reason = null): void
    {
        $this->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancellation_reason' => $reason,
        ]);
    }
}
