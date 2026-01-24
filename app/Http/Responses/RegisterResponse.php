<?php

namespace App\Http\Responses;

use Illuminate\Http\RedirectResponse;
use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;

class RegisterResponse implements RegisterResponseContract
{
    public function toResponse($request): RedirectResponse
    {
        $user = $request->user();
        if (! $user) {
            return redirect()->to('/');
        }

        $user->loadMissing('userRoles');
        $roles = $user->roleNames();

        if (in_array('admin', $roles, true)) {
            return redirect()->to('/admin/dashboard');
        }

        if (in_array('sales_rep', $roles, true)) {
            return redirect()->to('/sales-rep');
        }

        if (in_array('employee', $roles, true)) {
            return redirect()->to('/employee');
        }

        if (in_array('partner', $roles, true) && ! in_array('client', $roles, true)) {
            return redirect()->to('/partner');
        }

        return redirect()->to('/portal');
    }
}
