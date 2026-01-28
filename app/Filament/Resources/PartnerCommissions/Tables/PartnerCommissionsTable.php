<?php

namespace App\Filament\Resources\PartnerCommissions\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class PartnerCommissionsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('id')
                    ->label('ID')
                    ->searchable(),
                TextColumn::make('partner.id')
                    ->searchable(),
                TextColumn::make('deal.id')
                    ->searchable(),
                TextColumn::make('payment.id')
                    ->searchable(),
                TextColumn::make('commission_rate')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('gross_amount')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('net_amount')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('status')
                    ->searchable(),
                TextColumn::make('clawback_eligible_until')
                    ->dateTime()
                    ->sortable(),
                TextColumn::make('payout.id')
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
