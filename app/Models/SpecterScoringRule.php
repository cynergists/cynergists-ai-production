<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SpecterScoringRule extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'signal_key',
        'weight',
        'config',
        'is_active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'config' => 'array',
            'is_active' => 'boolean',
            'weight' => 'float',
            'sort_order' => 'integer',
        ];
    }
}
