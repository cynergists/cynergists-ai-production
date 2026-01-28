<?php

namespace App\Filament\Resources\PartnerScheduledReports\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class PartnerScheduledReportsTable
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
                TextColumn::make('cadence')
                    ->searchable(),
                IconColumn::make('is_active')
                    ->boolean(),
                TextColumn::make('last_sent_at')
                    ->dateTime()
                    ->sortable(),
                TextColumn::make('next_send_at')
                    ->dateTime()
                    ->sortable(),
                TextColumn::make('report_type')
                    ->searchable(),
                IconColumn::make('format_pdf')
                    ->boolean(),
                IconColumn::make('format_csv')
                    ->boolean(),
                TextColumn::make('day_of_week')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('day_of_month')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('timezone')
                    ->searchable(),
                TextColumn::make('detail_level')
                    ->searchable(),
                TextColumn::make('email_to')
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
