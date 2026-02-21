<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserRole;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class FilamentAdminUsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminUsers = [
            [
                'name' => 'Mike',
                'email' => 'mike@cynergists.ai',
            ],
            [
                'name' => 'Chris',
                'email' => 'chris@cynergists.com',
            ],
            [
                'name' => 'Ryan',
                'email' => 'ryan@cynergists.ai',
            ],
            [
                'name' => 'Jeffrey',
                'email' => 'jeffreydomingo509@gmail.com',
            ],
            [
                'name' => 'Andrew',
                'email' => 'andrew@cynergists.ai',
            ],
        ];

        $password = Hash::make('Cynergists.com12345');

        foreach ($adminUsers as $adminUser) {
            // Create or update the user
            $user = User::updateOrCreate(
                ['email' => $adminUser['email']],
                [
                    'name' => $adminUser['name'],
                    'password' => $password,
                    'is_active' => true,
                    'email_verified_at' => now(),
                ]
            );

            // Add admin role if not already assigned
            UserRole::firstOrCreate([
                'user_id' => $user->id,
                'role' => 'admin',
            ]);

            $this->command->info("Created/updated admin user: {$adminUser['email']}");
        }
    }
}
