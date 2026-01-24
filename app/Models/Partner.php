<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Partner extends Model
{
    /** @use HasFactory<\Database\Factories\PartnerFactory> */
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'company_name',
        'partner_type',
        'partner_status',
        'agreement_sent',
        'agreement_sent_date',
        'agreement_signed',
        'agreement_signed_date',
        'agreement_version',
        'commission_rate',
        'referrals_given',
        'qualified_referrals',
        'closed_won_deals',
        'revenue_generated',
        'total_commissions_earned',
        'outstanding_commission_balance',
        'last_commission_payout_date',
        'last_referral_date',
        'internal_owner_id',
        'partner_start_date',
        'last_activity_date',
        'next_follow_up_date',
        'partner_notes',
        'portal_access_enabled',
        'linked_user_id',
        'access_level',
        'last_login_date',
        'slug',
        'email_verified',
        'mfa_enabled',
        'payout_email_confirmed',
        'report_schedule',
        'created_by',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'agreement_sent' => 'boolean',
            'agreement_sent_date' => 'date',
            'agreement_signed' => 'boolean',
            'agreement_signed_date' => 'date',
            'commission_rate' => 'decimal:2',
            'revenue_generated' => 'decimal:2',
            'total_commissions_earned' => 'decimal:2',
            'outstanding_commission_balance' => 'decimal:2',
            'last_commission_payout_date' => 'date',
            'last_referral_date' => 'date',
            'partner_start_date' => 'date',
            'last_activity_date' => 'datetime',
            'next_follow_up_date' => 'date',
            'portal_access_enabled' => 'boolean',
            'last_login_date' => 'datetime',
            'email_verified' => 'boolean',
            'mfa_enabled' => 'boolean',
            'payout_email_confirmed' => 'boolean',
            'report_schedule' => 'array',
        ];
    }

    public function users(): HasMany
    {
        return $this->hasMany(PartnerUser::class);
    }

    public function referrals(): HasMany
    {
        return $this->hasMany(Referral::class);
    }

    public function deals(): HasMany
    {
        return $this->hasMany(PartnerDeal::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(PartnerPayment::class);
    }

    public function commissions(): HasMany
    {
        return $this->hasMany(PartnerCommission::class);
    }

    public function payoutMethods(): HasMany
    {
        return $this->hasMany(PartnerPayoutMethod::class);
    }

    public function payouts(): HasMany
    {
        return $this->hasMany(PartnerPayout::class);
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(PartnerTicket::class);
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(PartnerAuditLog::class);
    }

    public function scheduledReports(): HasMany
    {
        return $this->hasMany(PartnerScheduledReport::class);
    }

    public function reportRuns(): HasMany
    {
        return $this->hasMany(ReportRun::class);
    }
}
