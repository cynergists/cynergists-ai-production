<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\UserRole;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class CreateAdminUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:create-admin-user {email} {--name=} {--password=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create or promote a user to admin';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $email = strtolower(trim((string) $this->argument('email')));
        $name = (string) ($this->option('name') ?? '');
        $password = (string) ($this->option('password') ?? '');

        if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->error('Provide a valid email address.');

            return self::FAILURE;
        }

        if ($name === '') {
            $name = Str::of($email)->before('@')->replace(['.', '_'], ' ')->title()->value();
        }

        if ($password === '') {
            $password = Str::password(16);
            $this->info('Generated password: '.$password);
        }

        $user = User::query()->firstOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => Hash::make($password),
            ],
        );

        if ($user->wasRecentlyCreated === false && $name !== '' && $user->name !== $name) {
            $user->update(['name' => $name]);
        }

        UserRole::query()->firstOrCreate([
            'user_id' => $user->id,
            'role' => 'admin',
        ]);

        $this->info("Admin access granted to {$user->email}.");

        return self::SUCCESS;
    }
}
