<?php

namespace App\Filament\Resources\Partners\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class PartnersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('id')
                    ->label('ID')
                    ->searchable(),
                TextColumn::make('first_name')
                    ->searchable(),
                TextColumn::make('last_name')
                    ->searchable(),
                TextColumn::make('email')
                    ->label('Email address')
                    ->searchable(),
                TextColumn::make('phone')
                    ->searchable(),
                TextColumn::make('company_name')
                    ->searchable(),
                TextColumn::make('partner_type')
                    ->searchable(),
                TextColumn::make('partner_status')
                    ->searchable(),
                IconColumn::make('agreement_sent')
                    ->boolean(),
                TextColumn::make('agreement_sent_date')
                    ->date()
                    ->sortable(),
                IconColumn::make('agreement_signed')
                    ->boolean(),
                TextColumn::make('agreement_signed_date')
                    ->date()
                    ->sortable(),
                TextColumn::make('agreement_version')
                    ->searchable(),
                TextColumn::make('commission_rate')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('referrals_given')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('qualified_referrals')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('closed_won_deals')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('revenue_generated')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('total_commissions_earned')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('outstanding_commission_balance')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('last_commission_payout_date')
                    ->date()
                    ->sortable(),
                TextColumn::make('last_referral_date')
                    ->date()
                    ->sortable(),
                TextColumn::make('internal_owner_id')
                    ->searchable(),
                TextColumn::make('partner_start_date')
                    ->date()
                    ->sortable(),
                TextColumn::make('last_activity_date')
                    ->dateTime()
                    ->sortable(),
                TextColumn::make('next_follow_up_date')
                    ->date()
                    ->sortable(),
                IconColumn::make('portal_access_enabled')
                    ->boolean(),
                TextColumn::make('linked_user_id')
                    ->searchable(),
                TextColumn::make('access_level')
                    ->searchable(),
                TextColumn::make('last_login_date')
                    ->dateTime()
                    ->sortable(),
                TextColumn::make('slug')
                    ->searchable(),
                IconColumn::make('email_verified')
                    ->boolean(),
                IconColumn::make('mfa_enabled')
                    ->boolean(),
                IconColumn::make('payout_email_confirmed')
                    ->boolean(),
                TextColumn::make('created_by')
                    ->searchable(),
                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
            ])
            ->recordActions([
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
