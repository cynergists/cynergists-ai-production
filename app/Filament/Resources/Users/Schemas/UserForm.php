<?php

namespace App\Filament\Resources\Users\Schemas;

use App\Models\PortalAvailableAgent;
use Filament\Forms\Components\CheckboxList;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Tabs;
use Filament\Schemas\Components\Tabs\Tab;
use Filament\Schemas\Schema;

class UserForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Tabs::make('User')
                    ->persistTabInQueryString()
                    ->columnSpanFull()
                    ->tabs([
                        Tab::make('Details')
                            ->icon('heroicon-o-user')
                            ->schema([
                                TextInput::make('name')
                                    ->required(),
                                TextInput::make('email')
                                    ->label('Email address')
                                    ->email()
                                    ->required(),
                                DateTimePicker::make('email_verified_at'),
                                TextInput::make('password')
                                    ->password()
                                    ->dehydrated(fn (?string $state): bool => filled($state))
                                    ->required(false)
                                    ->helperText('Leave blank to send user a password creation link via email.'),
                                Toggle::make('is_active')
                                    ->default(true),
                            ])
                            ->columns(2),

                        Tab::make('Roles')
                            ->icon('heroicon-o-shield-check')
                            ->schema([
                                CheckboxList::make('roles')
                                    ->label('Roles')
                                    ->helperText('Assign roles to control user access throughout the application.')
                                    ->options([
                                        'admin' => 'Admin - Full access to Filament admin panel',
                                        'client' => 'Client - Portal access for customers',
                                        'partner' => 'Partner - Partner dashboard access',
                                        'sales_rep' => 'Sales Rep - Sales tools access',
                                        'employee' => 'Employee - Internal employee access',
                                    ])
                                    ->columns(2)
                                    ->bulkToggleable()
                                    ->dehydrated(false)
                                    ->validatedWhenNotDehydrated(false),
                            ]),

                        Tab::make('Agents')
                            ->icon('heroicon-o-sparkles')
                            ->schema([
                                CheckboxList::make('agents')
                                    ->label('Agents')
                                    ->helperText('Select AI agents to grant access to this user. A portal tenant and subscription will be created automatically if needed.')
                                    ->options(fn () => PortalAvailableAgent::query()
                                        ->where('is_active', true)
                                        ->orderBy('sort_order')
                                        ->pluck('name', 'id')
                                        ->toArray())
                                    ->descriptions(fn () => PortalAvailableAgent::query()
                                        ->where('is_active', true)
                                        ->orderBy('sort_order')
                                        ->pluck('job_title', 'id')
                                        ->toArray())
                                    ->columns(2)
                                    ->bulkToggleable()
                                    ->dehydrated(false)
                                    ->validatedWhenNotDehydrated(false),
                            ]),

                        Tab::make('Security')
                            ->icon('heroicon-o-lock-closed')
                            ->schema([
                                DateTimePicker::make('two_factor_confirmed_at')
                                    ->label('2FA Confirmed At')
                                    ->helperText('The date and time when two-factor authentication was confirmed.'),
                            ]),
                    ]),
            ]);
    }
}
