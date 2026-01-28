<?php

namespace App\Filament\Resources\StaffHours\Schemas;

use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class StaffHourForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('staff_id')
                    ->relationship('staff', 'name')
                    ->required(),
                DatePicker::make('period_start')
                    ->required(),
                DatePicker::make('period_end')
                    ->required(),
                TextInput::make('hours_worked')
                    ->required()
                    ->numeric()
                    ->default(0.0),
            ]);
    }
}
