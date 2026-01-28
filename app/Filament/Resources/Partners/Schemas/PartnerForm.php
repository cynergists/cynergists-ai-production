<?php

namespace App\Filament\Resources\Partners\Schemas;

use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class PartnerForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('first_name')
                    ->required(),
                TextInput::make('last_name')
                    ->required(),
                TextInput::make('email')
                    ->label('Email address')
                    ->email()
                    ->required(),
                TextInput::make('phone')
                    ->tel(),
                TextInput::make('company_name'),
                TextInput::make('partner_type')
                    ->required()
                    ->default('sole_proprietor'),
                TextInput::make('partner_status')
                    ->required()
                    ->default('active'),
                Toggle::make('agreement_sent')
                    ->required(),
                DatePicker::make('agreement_sent_date'),
                Toggle::make('agreement_signed')
                    ->required(),
                DatePicker::make('agreement_signed_date'),
                TextInput::make('agreement_version'),
                TextInput::make('commission_rate')
                    ->required()
                    ->numeric()
                    ->default(20.0),
                TextInput::make('referrals_given')
                    ->required()
                    ->numeric()
                    ->default(0),
                TextInput::make('qualified_referrals')
                    ->required()
                    ->numeric()
                    ->default(0),
                TextInput::make('closed_won_deals')
                    ->required()
                    ->numeric()
                    ->default(0),
                TextInput::make('revenue_generated')
                    ->required()
                    ->numeric()
                    ->default(0.0),
                TextInput::make('total_commissions_earned')
                    ->required()
                    ->numeric()
                    ->default(0.0),
                TextInput::make('outstanding_commission_balance')
                    ->required()
                    ->numeric()
                    ->default(0.0),
                DatePicker::make('last_commission_payout_date'),
                DatePicker::make('last_referral_date'),
                TextInput::make('internal_owner_id'),
                DatePicker::make('partner_start_date'),
                DateTimePicker::make('last_activity_date'),
                DatePicker::make('next_follow_up_date'),
                Textarea::make('partner_notes')
                    ->columnSpanFull(),
                Toggle::make('portal_access_enabled')
                    ->required(),
                TextInput::make('linked_user_id'),
                TextInput::make('access_level')
                    ->required()
                    ->default('standard'),
                DateTimePicker::make('last_login_date'),
                TextInput::make('slug'),
                Toggle::make('email_verified')
                    ->required(),
                Toggle::make('mfa_enabled')
                    ->required(),
                Toggle::make('payout_email_confirmed')
                    ->required(),
                TextInput::make('report_schedule'),
                TextInput::make('created_by'),
            ]);
    }
}
