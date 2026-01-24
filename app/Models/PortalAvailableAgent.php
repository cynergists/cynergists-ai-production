<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PortalAvailableAgent extends Model
{
    /** @use HasFactory<\Database\Factories\PortalAvailableAgentFactory> */
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'id',
        'name',
        'description',
        'price',
        'category',
        'icon',
        'features',
        'is_popular',
        'is_active',
        'sort_order',
        'perfect_for',
        'integrations',
        'image_url',
        'long_description',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'features' => 'array',
            'is_popular' => 'boolean',
            'is_active' => 'boolean',
            'perfect_for' => 'array',
            'integrations' => 'array',
        ];
    }
}
