<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CouponAuditLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'coupon_id',
        'event_type',
        'admin_id',
        'user_id',
        'metadata',
        'description',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function coupon()
    {
        return $this->belongsTo(Coupon::class);
    }

    public static function logEvent(
        string $eventType,
        ?int $couponId = null,
        ?string $adminId = null,
        ?string $userId = null,
        ?array $metadata = null,
        ?string $description = null
    ): self {
        return self::create([
            'coupon_id' => $couponId,
            'event_type' => $eventType,
            'admin_id' => $adminId,
            'user_id' => $userId,
            'metadata' => $metadata,
            'description' => $description,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
