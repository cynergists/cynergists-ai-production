<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PartnerCommission extends Model
{
    /** @use HasFactory<\Database\Factories\PartnerCommissionFactory> */
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'id',
        'partner_id',
        'deal_id',
        'payment_id',
        'commission_rate',
        'gross_amount',
        'net_amount',
        'status',
        'clawback_eligible_until',
        'payout_id',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'commission_rate' => 'decimal:4',
            'gross_amount' => 'decimal:2',
            'net_amount' => 'decimal:2',
            'clawback_eligible_until' => 'datetime',
        ];
    }

    public function partner(): BelongsTo
    {
        return $this->belongsTo(Partner::class);
    }

    public function deal(): BelongsTo
    {
        return $this->belongsTo(PartnerDeal::class, 'deal_id');
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(PartnerPayment::class, 'payment_id');
    }

    public function payout(): BelongsTo
    {
        return $this->belongsTo(PartnerPayout::class, 'payout_id');
    }
}
