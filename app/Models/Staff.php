<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Staff extends Model
{
    /** @use HasFactory<\Database\Factories\StaffFactory> */
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'id',
        'name',
        'title',
        'status',
        'start_date',
        'end_date',
        'hourly_pay',
        'hours_per_week',
        'monthly_pay',
        'email',
        'phone',
        'city',
        'country',
        'account_type',
        'bank_name',
        'account_number',
        'routing_number',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'hourly_pay' => 'decimal:2',
            'hours_per_week' => 'decimal:2',
            'monthly_pay' => 'decimal:2',
        ];
    }

    public function hours(): HasMany
    {
        return $this->hasMany(StaffHour::class);
    }
}
