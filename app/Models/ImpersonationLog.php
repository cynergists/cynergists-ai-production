<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ImpersonationLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'admin_id',
        'impersonated_user_id',
        'impersonated_user_email',
        'impersonated_user_name',
        'started_at',
        'ended_at',
        'end_reason',
        'reason',
        'actions_taken',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
        'actions_taken' => 'array',
    ];

    /**
     * Get the admin who performed the impersonation.
     */
    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    /**
     * Get the user who was impersonated.
     */
    public function impersonatedUser()
    {
        return $this->belongsTo(User::class, 'impersonated_user_id');
    }

    /**
     * Check if impersonation is still active.
     */
    public function isActive(): bool
    {
        return $this->ended_at === null;
    }

    /**
     * End the impersonation session.
     */
    public function end(string $reason = 'manual'): void
    {
        $this->update([
            'ended_at' => now(),
            'end_reason' => $reason,
        ]);
    }
}
