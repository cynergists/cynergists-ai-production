<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PartnerScheduledReport extends Model
{
    /** @use HasFactory<\Database\Factories\PartnerScheduledReportFactory> */
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'id',
        'partner_id',
        'cadence',
        'recipients',
        'is_active',
        'last_sent_at',
        'next_send_at',
        'report_type',
        'format_pdf',
        'format_csv',
        'day_of_week',
        'day_of_month',
        'timezone',
        'include_statuses',
        'detail_level',
        'email_to',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'recipients' => 'array',
            'is_active' => 'boolean',
            'last_sent_at' => 'datetime',
            'next_send_at' => 'datetime',
            'format_pdf' => 'boolean',
            'format_csv' => 'boolean',
            'include_statuses' => 'array',
        ];
    }

    public function partner(): BelongsTo
    {
        return $this->belongsTo(Partner::class);
    }

    public function runs(): HasMany
    {
        return $this->hasMany(ReportRun::class, 'report_id');
    }
}
