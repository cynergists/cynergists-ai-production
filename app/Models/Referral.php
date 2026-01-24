<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Referral extends Model
{
    /** @use HasFactory<\Database\Factories\ReferralFactory> */
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'id',
        'partner_id',
        'lead_email',
        'lead_name',
        'lead_phone',
        'lead_company',
        'source',
        'status',
        'attribution_type',
        'landing_page',
        'utm_params',
        'deal_id',
        'notes',
        'converted_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'utm_params' => 'array',
            'converted_at' => 'datetime',
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
}
