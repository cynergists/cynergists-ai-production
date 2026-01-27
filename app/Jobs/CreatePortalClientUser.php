<?php

namespace App\Jobs;

use App\Models\User;
use App\Models\UserRole;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Hash;

class CreatePortalClientUser implements ShouldQueue
{
    use Queueable;

    /**
     * @param  non-empty-string  $email
     * @param  non-empty-string  $password
     */
    public function __construct(
        public string $email,
        public string $password,
        public ?string $name = null,
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $user = User::query()->where('email', $this->email)->first();

        if (! $user) {
            $user = User::query()->create([
                'name' => $this->name ?: 'Portal Client',
                'email' => $this->email,
                'password' => Hash::make($this->password),
                'is_active' => true,
            ]);
        } else {
            $user->forceFill([
                'password' => Hash::make($this->password),
                'is_active' => true,
            ])->save();

            if ($this->name) {
                $user->forceFill(['name' => $this->name])->save();
            }
        }

        UserRole::query()->firstOrCreate([
            'user_id' => $user->id,
            'role' => 'client',
        ]);
    }
}
