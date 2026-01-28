<?php

namespace App\Filament\Resources\UserRoles\Schemas;

use Filament\Forms\Components\Select;
use Filament\Schemas\Schema;

class UserRoleForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('user_id')
                    ->relationship('user', 'name')
                    ->required(),
                Select::make('role')
                    ->options([
                        'client' => 'Client',
                        'partner' => 'Partner',
                        'admin' => 'Admin',
                        'sales_rep' => 'Sales rep',
                        'employee' => 'Employee',
                    ])
                    ->required(),
            ]);
    }
}
