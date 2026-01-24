<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AgentMemory extends Model
{
    /** @use HasFactory<\Database\Factories\AgentMemoryFactory> */
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'id',
        'customer_id',
        'memory_key',
        'memory_value',
        'agent_source',
        'expires_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'memory_value' => 'array',
            'expires_at' => 'datetime',
        ];
    }
}
