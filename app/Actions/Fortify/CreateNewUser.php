<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Models\PortalTenant;
use App\Models\Profile;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            'first_name' => ['required', 'string', 'max:50'],
            'last_name' => ['required', 'string', 'max:50'],
            'company_name' => ['required', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique(User::class)],
            'password' => $this->passwordRules(),
            'accept_terms' => ['accepted'],
            'user_type' => ['nullable', 'string', 'max:50'],
        ])->validate();

        return DB::transaction(function () use ($input): User {
            $isInternal = Str::endsWith(Str::lower($input['email']), '@cynergists.com');
            $role = $this->resolveRole($input, $isInternal);
            $status = $isInternal && $role === 'admin' ? 'pending' : 'active';

            $user = User::create([
                'name' => trim($input['first_name'].' '.$input['last_name']),
                'email' => $input['email'],
                'password' => $input['password'],
                'is_active' => true,
            ]);

            Profile::create([
                'user_id' => $user->id,
                'email' => $input['email'],
                'first_name' => $input['first_name'],
                'last_name' => $input['last_name'],
                'company_name' => $input['company_name'],
                'phone' => $input['phone'] ?? null,
                'status' => $status,
            ]);

            UserRole::create([
                'user_id' => $user->id,
                'role' => $role,
            ]);

            if ($role === 'client') {
                PortalTenant::create([
                    'id' => (string) Str::uuid(),
                    'user_id' => $user->id,
                    'company_name' => $input['company_name'],
                    'subdomain' => $this->generateTempSubdomain(),
                    'is_temp_subdomain' => true,
                    'status' => 'active',
                ]);
            }

            return $user;
        });
    }

    /**
     * @param  array<string, string>  $input
     */
    private function resolveRole(array $input, bool $isInternal): string
    {
        if ($isInternal) {
            return 'admin';
        }

        return $input['user_type'] ?? 'client';
    }

    private function generateTempSubdomain(): string
    {
        do {
            $subdomain = 'tmp-'.Str::lower(Str::random(8));
        } while (PortalTenant::where('subdomain', $subdomain)->exists());

        return $subdomain;
    }
}
