<?php

namespace App\Filament\Resources\Referrals\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class ReferralsTable
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
                TextColumn::make('lead_email')
                    ->searchable(),
                TextColumn::make('lead_name')
                    ->searchable(),
                TextColumn::make('lead_phone')
                    ->searchable(),
                TextColumn::make('lead_company')
                    ->searchable(),
                TextColumn::make('source')
                    ->searchable(),
                TextColumn::make('status')
                    ->searchable(),
                TextColumn::make('attribution_type')
                    ->searchable(),
                TextColumn::make('deal.id')
                    ->searchable(),
                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('converted_at')
                    ->dateTime()
                    ->sortable(),
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
